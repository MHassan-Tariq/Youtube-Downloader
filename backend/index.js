const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');

const app = express();
app.use(cors());

const log = (msg) => fs.appendFileSync('/tmp/debug.log', new Date().toISOString() + ' ' + msg + '\n');

// Robust bypass flags and headers
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const REFERER = 'https://www.youtube.com/';
const BYPASS_FLAGS = `--force-ipv4 --no-check-certificate --no-cache-dir --user-agent "${USER_AGENT}" --add-header "Referer:${REFERER}"`;

app.get('/download', (req, res) => {
    const url = req.query.url;
    log(`Request for info: ${url}`);

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const command = `yt-dlp ${BYPASS_FLAGS} -J "${url}"`;
    log(`Executing info fetch: ${command}`);

    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            log(`Exec error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to fetch video information. YouTube might be blocking the request.', details: stderr || error.message });
        }

        try {
            const info = JSON.parse(stdout);
            const videoId = info.id;
            const title = info.title;
            const rawFormats = info.formats || [];
            
            const formats = rawFormats
                .filter(f => f.ext !== 'mhtml' && !f.protocol.includes('m3u8') && !f.protocol.includes('dash'))
                .map(f => {
                    const protocol = req.protocol;
                    const host = req.get('host');
                    const proxyUrl = `${protocol}://${host}/proxy?url=${encodeURIComponent(url)}&format=${f.format_id}&ext=${f.ext}&title=${encodeURIComponent(title)}`;
                    
                    const hasVideo = f.vcodec && f.vcodec !== 'none';
                    const hasAudio = f.acodec && f.acodec !== 'none';

                    return {
                        url: proxyUrl,
                        formatId: f.format_id,
                        mimeType: (hasVideo ? 'video/' : 'audio/') + f.ext,
                        hasVideo,
                        hasAudio,
                        isStable: hasVideo && hasAudio, // Progressive formats
                        height: f.height || 0,
                        ext: f.ext
                    };
                })
                .sort((a, b) => {
                    // Prioritize formats with both audio and video (progressive)
                    if (a.isStable && !b.isStable) return -1;
                    if (!a.isStable && b.isStable) return 1;
                    
                    // Then prioritize those with video over audio-only
                    if (a.hasVideo && !b.hasVideo) return -1;
                    if (!a.hasVideo && b.hasVideo) return 1;

                    // Then by height descending
                    return (b.height || 0) - (a.height || 0);
                });

            const data = {
                url: 'https://www.youtube.com/embed/' + videoId,
                title: title,
                info: formats
            };
            
            return res.json({ data });

        } catch (parseError) {
            log(`Parse error: ${parseError.message}`);
            return res.status(500).json({ error: 'Failed to process video data.' });
        }
    });
});

app.get('/proxy', (req, res) => {
    const { url, format, ext, title } = req.query;
    
    if (!url || !format) {
        return res.status(400).send('URL and format are required');
    }

    log(`Proxying download: ${url} (format: ${format})`);

    try {
        const safeTitle = (title || 'video')
            .replace(/[^\x20-\x7E]/g, "_")
            .replace(/[/\\?%*:|"<>\s]/g, "_")
            .trim() || 'video';
        
        res.attachment(`${safeTitle}.${ext || 'mp4'}`);
    } catch (headerError) {
        log(`Header error: ${headerError.message}`);
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    }

    const command = `yt-dlp ${BYPASS_FLAGS} -f "${format}" -o - "${url}"`;
    log(`Executing proxy: ${command}`);

    const ytProcess = exec(command, { maxBuffer: 10 * 1024 * 1024 });

    ytProcess.stdout.pipe(res);

    ytProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.toLowerCase().includes('error')) log(`yt-dlp error: ${msg}`);
    });

    ytProcess.on('error', (err) => {
        log(`Process fatal error: ${err.message}`);
    });

    res.on('close', () => {
        if (ytProcess) {
            ytProcess.kill();
            log('Proxy connection closed, process killed');
        }
    });
});

app.listen(4000, () => {
    console.log(`Server is running on PORT: 4000`);
});