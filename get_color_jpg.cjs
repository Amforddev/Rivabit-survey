const fs = require('fs');
const jpeg = require('jpeg-js');

const jpegData = fs.readFileSync('src/assets/hero.png');
const rawImageData = jpeg.decode(jpegData);

const r = rawImageData.data[0];
const g = rawImageData.data[1];
const b = rawImageData.data[2];
const a = rawImageData.data[3];

console.log(`Top-left pixel: rgba(${r}, ${g}, ${b}, ${a})`);

const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
console.log(`Hex: ${hex}`);
