const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // Replace blue-orange gradients with gray-orange
      content = content.replace(/from-primary-500 to-accent-500/g, 'from-neutral-600 to-accent-500');
      content = content.replace(/from-primary-600 to-accent-600/g, 'from-neutral-700 to-accent-600');
      content = content.replace(/hover:from-primary-600 hover:to-accent-600/g, 'hover:from-neutral-700 hover:to-accent-600');
      
      // Replace solid blue gradients with gray-orange (since they want gray-orange everywhere)
      content = content.replace(/from-primary-500 to-primary-600/g, 'from-neutral-600 to-accent-500');
      content = content.replace(/hover:from-primary-600 hover:to-primary-700/g, 'hover:from-neutral-700 hover:to-accent-600');
      
      // Replace bottom underline effects
      content = content.replace(/bg-primary-500/g, 'bg-accent-500'); // If there are any primary lines, make them orange
      
      // Replace text colors
      content = content.replace(/text-primary-500/g, 'text-accent-500');
      content = content.replace(/text-primary-600/g, 'text-accent-600');
      
      // Replace border colors
      content = content.replace(/border-primary-500/g, 'border-accent-500');
      
      fs.writeFileSync(p, content, 'utf8');
    }
  });
}

walk('src');
console.log("Replaced gradients");
