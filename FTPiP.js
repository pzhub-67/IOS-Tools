// PiP Player for Scriptable (v3: with history)
// Plays an mp4 from a file or URL in a web view. Tap the PiP icon in the video controls.
// Requires History.js in the same Scriptable folder.

const History = importModule("History")
const fm = FileManager.local()
const dir = fm.joinPath(fm.temporaryDirectory(), "pip")
if (!fm.fileExists(dir)) fm.createDirectory(dir, true)

const a = new Alert()
a.title = "PiP Player"
a.addAction("Pick video file")
a.addAction("Enter URL")
a.addAction("History")
a.addCancelAction("Cancel")
const choice = await a.present()
if (choice === -1) return
if (choice === 2) {
  await History.show()
  return
}

let src
if (choice === 0) {
  const paths = await DocumentPicker.open(["public.movie"])
  if (!paths || !paths.length) return
  const from = paths[0]
  try { await fm.downloadFileFromiCloud(from) } catch (e) {}
  const dest = fm.joinPath(dir, "video.mp4")
  if (fm.fileExists(dest)) fm.remove(dest)
  fm.copy(from, dest)
  src = "video.mp4"
  History.add({ type: "play", title: fm.fileName(from, true) })
} else {
  const f = new Alert()
  f.title = "Video URL"
  f.addTextField("https://example.com/video.mp4", Pasteboard.paste() || "")
  f.addAction("Play")
  f.addCancelAction("Cancel")
  if ((await f.present()) === -1) return
  src = f.textFieldValue(0).trim()
  let title = src
  try { title = decodeURIComponent(src.split("?")[0].split("/").pop() || src) } catch (e) {}
  History.add({ type: "play", title: title || src, url: src })
}

const html = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html,body{margin:0;height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f66;font:14px -apple-system}
  video{width:100%;max-height:90%}
</style></head>
<body>
<video id="v" src="${src}" controls playsinline autoplay></video>
<div id="err"></div>
<script>
  const v = document.getElementById("v")
  v.addEventListener("error", () => {
    document.getElementById("err").textContent =
      "Video error code " + (v.error ? v.error.code : "?") + " (4 = unsupported format or blocked)"
  })
</script>
</body></html>`

const htmlPath = fm.joinPath(dir, "index.html")
fm.writeString(htmlPath, html)

const wv = new WebView()
await wv.loadFile(htmlPath)
await wv.present(true)
