const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const servicesPath = path.join(__dirname, 'public', 'data', 'services.json');
const brandsDir = path.join(__dirname, 'public', 'images', 'brands');

const domains = {
  "JBL": "jbl.com",
  "Harman/Kardon": "harmankardon.com",
  "Marshall": "marshallheadphones.com",
  "Bose": "bose.com",
  "Sony": "sony.com",
  "Anker": "anker.com",
  "Xiaomi": "mi.com",
  "Philips": "philips.com",
  "Tronsmart": "tronsmart.com",
  "Apple": "apple.com",
  "Samsung": "samsung.com",
  "Redmi": "mi.com",
  "Poco": "po.co",
  "Motorola": "motorola.com",
  "Huawei": "huawei.com",
  "Honor": "hihonor.com",
  "OnePlus": "oneplus.com",
  "Google Pixel": "google.com",
  "Realme": "realme.com",
  "Oppo": "oppo.com",
  "Vivo": "vivo.com",
  "LG": "lg.com",
  "Hisense": "hisense.com",
  "Toshiba": "toshiba.com",
  "TCL": "tcl.com",
  "Kivi": "kivi.ua",
  "Sharp": "sharp.com",
  "Panasonic": "panasonic.com",
  "Bosch": "bosch.com",
  "Tefal": "tefal.com",
  "Moulinex": "moulinex.com",
  "Braun": "braun.com",
  "Kenwood": "kenwoodworld.com",
  "Delonghi": "delonghi.com",
  "Gorenje": "gorenje.com",
  "HP": "hp.com",
  "Lenovo": "lenovo.com",
  "Asus": "asus.com",
  "Dell": "dell.com",
  "Acer": "acer.com",
  "MSI": "msi.com",
  "Microsoft Surface": "microsoft.com",
  "Sennheiser": "sennheiser.com",
  "Beats": "beatsbydre.com",
  "EcoFlow": "ecoflow.com",
  "Bluetti": "bluettipower.com",
  "Jackery": "jackery.com",
  "Zendure": "zendure.com",
  "Goal Zero": "goalzero.com",
  "Saeco": "saeco.com",
  "Jura": "jura.com",
  "Krups": "krups.com",
  "Siemens": "siemens.com",
  "Nivona": "nivona.com",
  "Gaggia": "gaggia.com",
  "Miele": "miele.com",
  "Intel": "intel.com",
  "AMD": "amd.com",
  "NVIDIA": "nvidia.com",
  "Gigabyte": "gigabyte.com",
  "ASRock": "asrock.com",
  "Kingston": "kingston.com"
};

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed with status ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  if (!fs.existsSync(brandsDir)) {
    fs.mkdirSync(brandsDir, { recursive: true });
  }

  const data = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
  
  for (const category of data.categories) {
    for (const brand of category.brands) {
      const domain = domains[brand.name];
      if (!domain) {
        console.warn(`No domain for brand: ${brand.name}`);
        continue;
      }
      
      const safeName = brand.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const destFile = path.join(brandsDir, `${safeName}.webp`);
      const url = `https://logo.clearbit.com/${domain}?size=256`;
      
      try {
        const buffer = await download(url);
        await sharp(buffer)
          .webp({ quality: 90 })
          .toFile(destFile);
        
        console.log(`Saved ${brand.name}`);
        brand.logo = `/images/brands/${safeName}.webp`;
      } catch (e) {
        console.warn(`Failed to download ${brand.name}: ${e.message}`);
        // keep original if failed
      }
    }
  }

  fs.writeFileSync(servicesPath, JSON.stringify(data, null, 2));
  console.log('Done!');
}

run();
