// Audio Grabber for Scriptable
// Paste a direct audio link OR a web page link. For pages, the script looks for audio files the page itself exposes.
// Requires History.js in the same Scriptable folder.

const History = importModule("History")
const fm = FileManager.local()
const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac)(\?|$)/i

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

function findAudio(html, base) {
  const found = new Set()
  const patterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:audio(?::secure_url|:url)?|twitter:player:stream)["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:audio(?::secure_url|:url)?|twitter:player:stream)["']/gi,
    /<(?:audio|source)[^>]+src=["']([^"']+)["']/gi,
    /["'](https?:(?:\\?\/){2}[^"'\s<>]+?\.(?:mp3|m4a|aac|wav|ogg|oga|opus|flac)(?:\?[^"'\s<>]*)?)["']/gi
  ]
  for (const re of patterns) {
    let m
    while ((m = re.exec(html)) !== null) {
      const u = resolve(m[1], base)
      if (u && AUDIO_EXT.test(u.split("#")[0])) found.add(u)
    }
  }
  return [...found]
}

async function isAudioLink(url) {
  if (AUDIO_EXT.test(url)) return true
  try {
    const h = new Request(url)
    h.method = "HEAD"
    h.timeoutInterval = 20
    await h.load()
    return (h.response.mimeType || "").toLowerCase().startsWith("audio/")
  } catch (e) {
    return false
  }
}

async function download(target, sourcePage) {
  let name = ""
  try { name = decodeURIComponent(target.split("?")[0].split("/").pop() || "") } catch (e) {}
  if (!/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac)$/i.test(name)) name = "audio-" + Date.now() + ".mp3"
  const path = fm.joinPath(fm.temporaryDirectory(), name)

  const req = new Request(target)
  req.timeoutInterval = 600
  const data = await req.load()
  const status = req.response.statusCode
  if (status < 200 || status >= 300) throw new Error("Server returned HTTP " + status)
  const type = (req.response.mimeType || "").toLowerCase()
  if (type.includes("text/html")) throw new Error("That link returned a web page, not an audio file.")

  fm.write(path, data)
  History.add({ type: "audio", title: name, url: target, page: sourcePage !== target ? sourcePage : undefined })
  // Choose "Save to Files" (or send it to another app)
  await ShareSheet.present([path])
}

// ---- main ----
const a = new Alert()
a.title = "Download Audio"
a.message = "Paste an audio link or a web page link"
a.addTextField("https://...", Pasteboard.paste() || "")
a.addAction("Go")
a.addAction("History")
a.addCancelAction("Cancel")
const choice = await a.present()
if (choice === -1) return
if (choice === 1) {
  await History.show()
  return
}

const url = a.textFieldValue(0).trim()
if (!/^https?:\/\//i.test(url)) {
  await alertMsg("Invalid link", "Link must start with http:// or https://")
  return
}

try {
  let target = url

  if (!(await isAudioLink(url))) {
    const page = new Request(url)
    page.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    }
    page.timeoutInterval = 30
    const html = await page.loadString()
    const files = findAudio(html, url)

    if (files.length === 0) {
      await alertMsg(
        "No audio found",
        "This page doesn't expose a downloadable audio file. Streaming-only sites can't be saved this way."
      )
      return
    }

    if (files.length === 1) {
      target = files[0]
    } else {
      const pick = new Alert()
      pick.title = "Multiple audio files found"
      files.slice(0, 8).forEach((v, i) => pick.addAction((i + 1) + ". " + v.split("?")[0].split("/").pop()))
      pick.addCancelAction("Cancel")
      const idx = await pick.present()
      if (idx === -1) return
      target = files[idx]
    }
  }

  await download(target, url)
} catch (err) {
  await alertMsg("Download failed", String(err.message || err))
}
