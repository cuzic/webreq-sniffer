# Quick Start Guide

Get started with WebreqSniffer in 5 minutes!

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Build the extension**:

   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `dist` folder

3. **Verify installation**:
   - You should see the WebreqSniffer icon in your toolbar
   - Click the icon to open the popup

## Basic Usage

### Example 1: Capture Video Playlist

**Goal**: Capture an HLS video playlist URL

1. **Configure Settings** (first time only):
   - Click the extension icon
   - Click the ⚙️ (Settings) button
   - Go to the **Filters** tab
   - Click **動画ストリーミング** (Video Streaming) preset
   - Click **Save Settings** at the bottom

2. **Start Monitoring**:
   - Click the extension icon
   - Ensure scope is set to **アクティブタブのみ** (Active Tab Only)
   - Click **監視スタート** (Start Monitoring)
   - You should see **● 監視中** (Monitoring)

3. **Browse to Video**:
   - Navigate to the video streaming site
   - Play the video
   - The extension captures requests in the background

4. **Export Logs**:
   - Click the extension icon
   - Click **ログをダウンロード** (Download Logs)
   - Choose **Bash (yt-dlp)**
   - A script file will be downloaded

5. **Use the Script**:
   ```bash
   chmod +x netlog_*.sh
   ./netlog_*.sh
   ```

### Example 2: Capture Specific Files

**Goal**: Capture only .pdf files from a specific domain

1. **Configure Filters**:
   - Open Settings (⚙️)
   - Go to **Filters** tab
   - **Simple Filters**: Add `.pdf`
   - **Allow List**: Add the domain (e.g., `documents.example.com`)
   - **Resource Types**: Check only **main_frame** and **xmlhttprequest**
   - Save Settings

2. **Monitor and Export**:
   - Start monitoring
   - Browse the site and download PDFs
   - Export as **URL List (.txt)**

### Example 3: Capture API Requests

**Goal**: Capture API requests for analysis

1. **Configure Filters**:
   - Open Settings
   - **Simple Filters**: Add `/api/`
   - **Resource Types**: Check **xmlhttprequest**
   - Enable **Basic Headers** in Collection Policy tab

2. **Export with Headers**:
   - Monitor the site
   - Export as **Bash (curl + Headers)**
   - The script includes headers like User-Agent and Referer

## Settings Overview

### Filters Tab

- **Presets**: Quick one-click configurations
  - 動画ストリーミング (Video): .m3u8, .mpd, .ts, .m4s
  - ドキュメント (Documents): .pdf, .doc, .xls
  - 画像 (Images): image resources

- **Simple Filters**: Pattern matching (e.g., `.m3u8`, `/video/`)
- **Regex Filters**: Advanced patterns (e.g., `.*\.m3u8.*`)
- **Resource Types**: Filter by request type
- **Allow/Deny Lists**: Domain filtering with wildcards

### Collection Policy Tab

- **HLS/DASH Streaming Mode**:
  - **Playlist Only** (推奨): Captures only .m3u8/.mpd, skips segments
  - **All Segments**: Captures everything (may result in thousands of requests)

- **Header Collection**:
  - **Basic Headers**: User-Agent, Referer, Origin (safe, ON by default)
  - **Sensitive Headers**: Cookie, Authorization (⚠️ security risk, OFF by default)

### Limits & Export Tab

- **Max Entries**: Default 3000 (ring buffer, auto-removes old entries)
- **Filename Template**: Customize export filenames
  - Variables: `{date}`, `{domain}`, `{ext}`
  - Example: `netlog_{date}_{domain}.{ext}` → `netlog_2025-01-17_example-com.sh`
- **Line Ending**: LF (Unix) or CRLF (Windows)

## Tips & Best Practices

### 1. Start with Presets

Always start with a preset and modify as needed. This ensures you don't miss important filter settings.

### 2. Use Active Tab Scope

Unless you need to monitor multiple tabs, use "Active Tab Only" to reduce noise.

### 3. HLS/DASH Mode

For video streaming, **always use "Playlist Only" mode** to avoid capturing thousands of segment requests.

### 4. Clear Logs Regularly

The extension stores logs in memory. Clear them when you're done to free up resources.

### 5. Export Format Selection

| Format                | Use Case              | Headers | Best For             |
| --------------------- | --------------------- | ------- | -------------------- |
| URL List              | Simple URL collection | No      | Quick reference      |
| Bash (curl)           | Basic downloads       | No      | Simple files         |
| Bash (curl + Headers) | Downloads with auth   | Yes     | Protected content    |
| Bash (yt-dlp)         | Video downloads       | Yes     | Streaming media      |
| PowerShell            | Windows users         | Yes     | Windows environments |

### 6. Privacy Protection

- **Never enable Sensitive Headers** unless absolutely necessary
- **Clear logs** before closing the browser
- **Don't share scripts** that contain your cookies/auth tokens

## Troubleshooting

### No Logs Captured

**Problem**: Monitoring is active but no logs appear

**Solutions**:

1. Check if filters are too restrictive
2. Verify the resource type is enabled
3. Check Allow/Deny lists
4. Try with empty filters (capture everything)

### Too Many Logs

**Problem**: Thousands of logs captured

**Solutions**:

1. Use **Active Tab** scope instead of All Tabs
2. Enable **Playlist Only** mode for streaming
3. Add aggressive filters (Simple/Regex)
4. Use Deny List for tracking/analytics domains

### Export File Empty

**Problem**: Downloaded script is empty

**Solutions**:

1. Ensure logs were captured (check count in popup)
2. Verify export format supports your use case
3. Check browser download settings

### Headers Missing in Export

**Problem**: Exported script doesn't include headers

**Solutions**:

1. Enable **Basic Headers** in Settings → Collection Policy
2. Use export format that supports headers:
   - ✅ Bash (curl + Headers)
   - ✅ Bash (yt-dlp)
   - ✅ PowerShell
   - ❌ URL List
   - ❌ Bash (curl) - no headers version

## Next Steps

- Explore the [full README](../README.md) for detailed documentation
- Check the [requirements document](requirements.md) for technical details
- Report issues on [GitHub](https://github.com/cuzic/webreq-sniffer/issues)

---

**Happy monitoring! 🎉**
