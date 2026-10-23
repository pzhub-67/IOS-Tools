# Scriptable Video Tools

Two small [Scriptable](https://scriptable.app) scripts for iPhone that make working with video easier.

| Script | What it does |
| --- | --- |
| `PiPPlayer.js` | Plays a video (picked file or URL) in a full-screen player with Picture-in-Picture support |
| `VideoDownloader.js` | Downloads a video from a direct link or a web page that exposes a video file |

## Requirements

- iPhone or iPad with iOS 15 or later
- [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) (free)

## Installation

1. Download `PiPPlayer.js` and `VideoDownloader.js` from this repo.
2. Move them into the Scriptable folder (Files app, then iCloud Drive, then Scriptable), or open each file in Scriptable and paste in the contents as a new script.
3. Tap a script in Scriptable to run it.

## PiP Player

1. Run `PiPPlayer`.
2. Choose **Pick video file** or **Enter URL**.
3. When the video starts, tap the Picture-in-Picture icon in the player controls, then swipe home to keep watching.

Notes:

- Picked files are copied to a temporary folder and loaded locally.
- Whether the PiP button appears depends on iOS and Scriptable's web view. If it doesn't, open the video in Safari instead.
- If playback fails, an error code is shown on screen. Code 4 usually means an unsupported format or a blocked URL.

## Video Downloader

1. Copy a link, then run `VideoDownloader`. The clipboard is prefilled.
2. Tap **Go**.
3. If the link is a web page, the script searches it for video files. If it finds more than one, you choose which to download.
4. In the share sheet, choose **Save Video** (Photos) or **Save to Files**.

Limitations:

- Works with direct video file links (`.mp4`, `.mov`, `.m4v`, `.webm`) and pages that expose one in their markup.
- Streaming-only sites (HLS/`.m3u8` playlists, and sites that don't expose a plain video file) are not supported.
- Pages that require a login can't be read.
- Videos are loaded fully into memory before saving, so very large files may fail.

## Responsible use

Only download or play videos you have the right to use. You are responsible for following the terms of service of any site you use these scripts with and for complying with copyright law.

## License

This project is licensed under the GNU General Public License. See the [LICENSE](LICENSE) file for details.

Probably could be set up for IOS shortcuts
