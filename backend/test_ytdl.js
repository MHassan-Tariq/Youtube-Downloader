const ytdl = require('@distube/ytdl-core');

const url = 'https://www.youtube.com/watch?v=sywacbBvFi0';

console.log('Starting standalone test...');

(async () => {
    try {
        console.log('Getting ID...');
        const id = await ytdl.getURLVideoID(url);
        console.log('ID:', id);
        console.log('Getting Info...');
        const info = await ytdl.getInfo(url);
        console.log('Title:', info.videoDetails.title);
        console.log('Stringifying formats...');
        JSON.stringify(info.formats);
        console.log('Stringify success');
    } catch (err) {
        console.error('Caught error:', err);
    }
})();
