const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('src/assets/logo.png')
  .pipe(new PNG())
  .on('parsed', function() {
    const r = this.data[0];
    const g = this.data[1];
    const b = this.data[2];
    const a = this.data[3];
    console.log(`Top-left pixel: rgba(${r}, ${g}, ${b}, ${a})`);
    
    // Convert to hex
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    console.log(`Hex: ${hex}`);
  })
  .on('error', function(err) {
    console.error('Error parsing PNG:', err);
  });
