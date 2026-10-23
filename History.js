// History.js: shared module (not run directly; imported by the other scripts)
// Stores a log of everything you play or download in media-history.json
// inside Scriptable's documents folder.

const fm = FileManager.local()
const FILE = fm.joinPath(fm.documentsDirectory(), "media-history.json")
const MAX = 500
const LABELS = { play: "Played", video: "Video downloaded", audio: "Audio downloaded" }

function load() {
  try {
    if (!fm.fileExists(FILE)) return []
    return JSON.parse(fm.readString(FILE)) || []
  } catch (e) {
    return []
  }
}

function save(items) {
  fm.writeString(FILE, JSON.stringify(items))
}

// entry: { type: "play" | "video" | "audio", title: string, url?: string, page?: string }
function add(entry) {
  const items = load()
  items.unshift(Object.assign({ time: Date.now() }, entry))
  save(items.slice(0, MAX))
}

function clear() {
  save([])
}

function fmtTime(ts) {
  const df = new DateFormatter()
  df.dateFormat = "MMM d, h:mm a"
  return df.string(new Date(ts))
}

async function show() {
  const table = new UITable()
  table.showSeparators = true

  function render() {
    table.removeAllRows()
    const items = load()

    const head = new UITableRow()
    head.isHeader = true
    head.addText("History (" + items.length + ")")
    table.addRow(head)

    if (items.length) {
      const clearRow = new UITableRow()
      clearRow.dismissOnSelect = false
      const c = clearRow.addText("Clear all history")
      c.titleColor = Color.red()
      clearRow.onSelect = async () => {
        const a = new Alert()
        a.title = "Clear all history?"
        a.addDestructiveAction("Clear")
        a.addCancelAction("Cancel")
        if ((await a.present()) === 0) {
          clear()
          render()
        }
      }
      table.addRow(clearRow)
    } else {
      const empty = new UITableRow()
      empty.addText("Nothing here yet")
      table.addRow(empty)
    }

    items.forEach((it, i) => {
      const row = new UITableRow()
      row.height = 64
      row.dismissOnSelect = false
      const cell = row.addText(
        it.title || it.url || "Untitled",
        (LABELS[it.type] || it.type) + " · " + fmtTime(it.time)
      )
      cell.titleFont = Font.semiboldSystemFont(15)
      cell.subtitleFont = Font.systemFont(12)
      cell.subtitleColor = Color.gray()
      row.onSelect = async () => {
        const a = new Alert()
        a.title = it.title || "Entry"
        a.message = it.url || it.page || ""
        if (it.url) {
          a.addAction("Open link")
          a.addAction("Copy link")
        }
        a.addDestructiveAction("Delete entry")
        a.addCancelAction("Cancel")
        const choice = await a.present()
        if (choice === -1) return
        if (it.url && choice === 0) {
          Safari.open(it.url)
        } else if (it.url && choice === 1) {
          Pasteboard.copy(it.url)
        } else {
          const all = load()
          all.splice(all.findIndex(x => x.time === it.time && x.title === it.title), 1)
          save(all)
          render()
        }
      }
      table.addRow(row)
    })

    table.reload()
  }

  render()
  await table.present(false)
}

module.exports = { add, load, clear, show }
