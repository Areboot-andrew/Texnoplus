const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://texno.plus';

function generateSitemap() {
  const dataPath = path.join(__dirname, 'public', 'data', 'services.json');
  const servicesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const urls = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/brands', changefreq: 'monthly', priority: 0.8 },
    { url: '/faq', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.8 }
  ];

  servicesData.categories.forEach(category => {
    // Add category page
    urls.push({
      url: `/service/${category.id}`,
      changefreq: 'weekly',
      priority: 0.9
    });

    // Add brand specific pages for this category
    if (category.brands && Array.isArray(category.brands)) {
      category.brands.forEach(brand => {
        const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        urls.push({
          url: `/service/${category.id}/${brandSlug}`,
          changefreq: 'monthly',
          priority: 0.7
        });
      });
    }
  });

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${DOMAIN}${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent, 'utf8');
  console.log(`Sitemap generated with ${urls.length} URLs at ${outputPath}`);
}

generateSitemap();
