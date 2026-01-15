const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const log = (msg) => fs.appendFileSync('/tmp/debug.log', new Date().toISOString() + ' ' + msg + '\n');

app.get('/download', (req, res) => {
    const url = req.query.url;
    log(`Request for: ${url}`);

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // -J: Dump JSON
    // --flat-playlist: If it's a playlist, don't list all videos, just the playlist info
    const command = `yt-dlp -J "${url}"`;

    // Increase maxBuffer to 10MB as JSON can be large
    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            log(`Exec error: ${error.message}`);
            console.error('Exec error:', error);
            
            // Try to extract a user-friendly message from stderr
            let userMessage = 'Failed to fetch video information.';
            if (stderr.includes('Sign in to confirm your age')) {
                userMessage = 'This video is age-restricted and cannot be downloaded properly.';
            } else if (stderr.includes('Video unavailable')) {
                userMessage = 'This video is unavailable (deleted or private).';
            } else if (stderr.includes('Incomplete YouTube ID')) {
                userMessage = 'Invalid YouTube URL provided.';
            }

            return res.status(500).json({ error: userMessage, details: stderr || error.message });
        }

        try {
            const info = JSON.parse(stdout);
            
            const videoId = info.id;
            const rawFormats = info.formats || [];
            
            const formats = rawFormats.map(f => ({
                url: f.url,
                mimeType: (f.vcodec !== 'none' && f.video_ext !== 'none' ? 'video/' : 'audio/') + f.ext,
                hasVideo: f.vcodec !== 'none' && f.video_ext !== 'none',
                height: f.height || 0
            }));

            const data = {
                url: 'https://www.youtube.com/embed/' + videoId,
                info: formats
            };
            
            log('Successfully fetched info');
            return res.json({ data }); // Wrap in data object to match frontend expectation or adjust frontend

        } catch (parseError) {
            log(`Parse error: ${parseError.message}`);
            return res.status(500).json({ error: 'Failed to process video data.' });
        }
    });
});

app.listen(4000, () => {
    console.log(`Server is running on PORT: 4000`);
});