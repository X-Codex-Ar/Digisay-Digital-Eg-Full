const fs = require('fs');

async function check() {
  const res = await fetch('https://digisay.com');
  const t = await res.text();
  fs.writeFileSync('digisay-home.html', t, 'utf-8');
  console.log('Saved html. Size:', t.length);

  // Search for video elements or classes or links
  const lines = t.split('\n');
  lines.forEach((line, i) => {
    if (/watch video|play video|video-button|elementor-video|popup-video|mfp-iframe|lightbox/i.test(line)) {
      console.log(`Line ${i}:`, line.trim().substring(0, 200));
    }
  });

  // Search for youtube/vimeo/mp4
  const videoRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|webm)|https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com)[^\s"'<>]+)/gi;
  let m;
  while ((m = videoRegex.exec(t)) !== null) {
    console.log('Video link match:', m[0]);
  }
}

check().catch(console.error);
