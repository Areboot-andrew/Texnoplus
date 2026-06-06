const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const html = await fetchHtml('https://worldvectorlogo.com/search?q=moulinex');
  // Match cdn link like https://cdn.worldvectorlogo.com/logos/moulinex.svg
  const match = html.match(/https:\/\/cdn\.worldvectorlogo\.com\/logos\/[a-zA-Z0-9-]+\.svg/i);
  if (match) {
    console.log("FOUND SVG:", match[0]);
  } else {
    console.log("NO SVG FOUND");
  }
}

run();
