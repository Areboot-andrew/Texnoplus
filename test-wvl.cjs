const https = require('https');

https.get('https://worldvectorlogo.com/search?q=moulinex', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.slice(0, 500));
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
