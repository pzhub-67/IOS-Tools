# Scriptable Media Tools

Small [Scriptable](https://scriptable.app) scripts for iPhone that make working with video and audio easier, with a shared history of everything you play or download.

| Script | What it does |
| --- | --- |
| `FTPiP.js` | Plays a video (picked file or URL) in a full-screen player with Picture-in-Picture support |
| `LTMp4.js` | Downloads a video from a direct link or a web page that exposes a video file |
| `AudioGrabber.js` | Downloads an audio file from a direct link or a web page that exposes one |
| `HistoryViewer.js` | Opens the history of everything played or downloaded |
| `History.js` | Shared module the other scripts use (not run directly) |

## Requirements

- iPhone or iPad with iOS 15 or later
- [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) (free)

## Installation

1. Download all the `.js` files from this repo.
2. Move them into the Scriptable folder (Files app, then iCloud Drive, then Scriptable). All files must be in the same folder, because the scripts import `History.js`.
3. Tap a script in Scriptable to run it.

## PiP Player

1. Run `FTPiP`.
2. Choose **Pick video file** or **Enter URL**. The URL field is prefilled from your clipboard.
3. When the video starts, tap the Picture-in-Picture icon in the player controls, then swipe home to keep watching.

Notes:

- Picked files are copied to a temporary folder and loaded locally.
- Whether the PiP button appears depends on iOS and Scriptable's web view. If it doesn't, open the video in Safari instead.
- If playback fails, an error code is shown on screen. Code 4 usually means an unsupported format or a blocked URL.

## Video Downloader

1. Copy a link, then run `LTMp4`. The clipboard is prefilled.
2. Tap **Go**.
3. If the link is a web page, the script searches it for video files. If it finds more than one, you choose which to download.
4. In the share sheet, choose **Save Video** (Photos) or **Save to Files**.

## Audio Grabber

Works the same way as the video downloader, but looks for audio files (`.mp3`, `.m4a`, `.aac`, `.wav`, `.ogg`, `.oga`, `.opus`, `.flac`). In the share sheet, choose **Save to Files** or send the file to another app.

## History

Every script has a **History** button, and `HistoryViewer` opens it directly. It logs what you played and what you downloaded, with the time and source link. Tap an entry to open the link, copy it, or delete it. You can also clear everything.

History is stored in `media-history.json` in Scriptable's documents folder (up to 500 entries). It stays on your device.

## Limitations

- Downloaders work with direct file links (`.mp4`, `.mov`, `.m4v`, `.webm` for video; common audio formats for audio) and pages that expose one in their markup.
- Streaming-only sites (HLS/`.m3u8` playlists, and sites that don't expose a plain media file) are not supported.
- Pages that require a login can't be read.
- Files are loaded fully into memory before saving, so very large files may fail.

## Responsible use

Only download or play media you have the right to use. You are responsible for following the terms of service of any site you use these scripts with and for complying with copyright law.

## License

This project is licensed under the GNU General Public License. See the [LICENSE](LICENSE) file for details.
