const crypto = require('crypto');

function getWikiUrl(filename) {
    const name = filename.replace(/ /g, '_');
    const hash = crypto.createHash('md5').update(name).digest('hex');
    const a = hash.substring(0, 1);
    const b = hash.substring(0, 2);
    return `https://upload.wikimedia.org/wikipedia/commons/${a}/${b}/${name}`;
}

console.log(getWikiUrl("JBL_logo.svg"));
console.log(getWikiUrl("JBL Logo.svg"));
