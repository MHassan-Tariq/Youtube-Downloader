# H/J Developments Youtube Downloader

A modern, minimalist web application for downloading YouTube videos and audio. Built with React, Node.js, and the powerful `yt-dlp` engine.

## 🚀 Features

- **Clean & Minimalist Design**: A premium "White & Black" theme focusing on simplicity and usability.
- **Audio & Video Separation**: Clearly distinct columns for selecting video resolutions (1080p, 720p, etc.) or pure audio formats.
- **One-Click Downloads**: Direct download buttons with clear format indicators.
- **Robust Error Handling**: Real-time feedback for invalid URLs, age-restricted content, or unavailable videos.
- **No API Key Required**: Uses `yt-dlp` to fetch metadata directly, avoiding complex API quotas.

## 🛠️ Tech Stack

- **Frontend**: React (Create React App), Tailwind CSS
- **Backend**: Node.js, Express
- **Core Engine**: `yt-dlp` (Command line utility)

## 📦 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed on your system.
  - macOS: `brew install yt-dlp`
  - Windows/Linux: Follow official instructions.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hj-youtube-downloader.git
cd hj-youtube-downloader
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:4000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
# Client runs on http://localhost:8080
```

## 📝 Usage

1.  Start both backend and frontend servers.
2.  Open `http://localhost:8080` in your browser.
3.  Paste a valid YouTube link (e.g., `https://www.youtube.com/watch?v=...`).
4.  Click **Download**.
5.  Select your desired format (Video or Audio) and click the Download button.

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).


Project Demo:
![demo image](https://github.com/user-attachments/assets/2ac41146-fea8-4d8b-8585-f80c63e27c3a)

