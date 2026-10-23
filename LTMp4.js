// Video Downloader for Scriptable (v2: accepts web page links too)
// Paste a direct video link OR a web page link. For pages, the script looks for video files the page itself exposes.

const fm = FileManager.local()

async function alertMsg(title, msg) {
  const e = new Alert()
  e.title = title
  e.message = msg
  e.addCancelAction("OK")
  await e.present()
}

function clean(s) {
  return s
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
}

function resolve(link, base) {
  link = clean(link.trim())
  if (/^https?:\/\//i.test(link)) return link
  if (link.startsWith("//")) return "https:" + link
  const m = base.match(/^(https?:\/\/[^\/]+)(\/.*)?$/i)
  if (!m) return null
  if (link.startsWith("/")) return m[1] + link
  const dir = (m[2] || "/").split("?")[0].replace(/[^\/]*$/, "")
  return m[1] + dir + link
}

function findVideos(html, base) {
  const found = new Set()
  const patterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:video(?::secure_url|:url)?|twitter:player:stream)["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:video(?::secure_url|:url)?|twitter:player:stream)["']/gi,
    /<(?:video|source)[^>]+src=["']([^"']+)["']/gi,
    /["'](https?:(?:\\?\/){2}[^"'\s<>]+?\.(?:mp4|mov|m4v|webm)(?:\?[^"'\s<>]*)?)["']/gi
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(html)) !== null) {
      const u = resolve(m[1], base)
      if (u && /\.(mp4|mov|m4v|webm)(\?|$)/i.test(u.split("#")[0])) found.add(u)
    }
  }
  return [...found]
}

async function isVideoLink(url) {
  if (/\.(mp4|mov|m4v|webm)(\?|$)/i.test(url)) return true
  try {
    const h = new Request(url)
    h.method = "HEAD"
    h.timeoutInterval = 20
    await h.load()
    return (h.response.mimeType || "").toLowerCase().startsWith("video/")
  } catch (e) {
    return false
  }
}

async function download(url) {
  let name = ""
  try { name = decodeURIComponent(url.split("?")[0].split("/").pop() || "") } catch (e) {}
  if (!/\.(mp4|mov|m4v|webm)$/i.test(name)) name = "video-" + Date.now() + ".mp4"
  const path = fm.joinPath(fm.temporaryDirectory(), name)

  const req = new Request(url)
  req.timeoutInterval = 600
  const data = await req.load()
  const status = req.response.statusCode
  if (status < 200 || status >= 300) throw new Error("Server returned HTTP " + status)
  const type = (req.response.mimeType || "").toLowerCase()
  if (type.includes("text/html")) throw new Error("That link returned a web page, not a video.")

  fm.write(path, data)
  // Choose "Save Video" (Photos) or "Save to Files"
  await ShareSheet.present([path])
}

// ---- main ----
const a = new Alert()
a.title = "Download Video"
a.message = "Paste a video link or a web page link"
a.addTextField("https://...", Pasteboard.paste() || "")
a.addAction("Go")
a.addCancelAction("Cancel")
if ((await a.present()) === -1) return

const url = a.textFieldValue(0).trim()
if (!/^https?:\/\//i.test(url)) {
  await alertMsg("Invalid link", "Link must start with http:// or https://")
  return
}

try {
  let target = url

  if (!(await isVideoLink(url))) {
    const page = new Request(url)
    page.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    }
    page.timeoutInterval = 30
    const html = await page.loadString()
    const videos = findVideos(html, url)

    if (videos.length === 0) {
      await alertMsg(
        "No video found",
        "This page doesn't expose a downloadable video file. Streaming-only sites (HLS/.m3u8, YouTube, etc.) can't be saved this way."
      )
      return
    }

    if (videos.length === 1) {
      target = videos[0]
    } else {
      const pick = new Alert()
      pick.title = "Multiple videos found"
      videos.slice(0, 8).forEach((v, i) => pick.addAction((i + 1) + ". " + v.split("?")[0].split("/").pop()))
      pick.addCancelAction("Cancel")
      const idx = await pick.present()
      if (idx === -1) return
      target = videos[idx]
    }
  }

  await download(target)
} catch (err) {
  await alertMsg("Download failed", String(err.message || err))
}
