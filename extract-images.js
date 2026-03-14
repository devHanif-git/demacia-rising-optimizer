const fs = require('fs');

const html = fs.readFileSync('wiki.html', 'utf8');
const regex = /<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/g;

let m;
const images = {};
while(m = regex.exec(html)) {
  const url = m[1];
  const alt = m[2];
  if (url.includes('Sprite') || alt.includes('DR Sprite')) {
    images[alt.replace(/ DR Sprite.*/, '').trim()] = url.split('/revision')[0];
  }
}

console.log(JSON.stringify(images, null, 2));
