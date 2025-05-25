const fs = require('fs');

// Create a simple PNG icon programmatically
function createSimplePNG(width, height, color) {
  // PNG header and basic structure for a solid color image
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(2, 17); // Color type (RGB)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  
  // Calculate CRC for IHDR
  const crc32 = require('zlib').crc32;
  const ihdrCrc = crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);
  
  // Create image data (simplified - solid color)
  const bytesPerPixel = 3; // RGB
  const rowBytes = width * bytesPerPixel + 1; // +1 for filter byte
  const imageDataSize = height * rowBytes;
  const imageData = Buffer.alloc(imageDataSize);
  
  // Fill with color data
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    imageData[rowStart] = 0; // Filter type: None
    
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * bytesPerPixel;
      imageData[pixelStart] = r;
      imageData[pixelStart + 1] = g;
      imageData[pixelStart + 2] = b;
    }
  }
  
  // Compress image data
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(imageData);
  
  // IDAT chunk
  const idat = Buffer.alloc(12 + compressedData.length);
  idat.writeUInt32BE(compressedData.length, 0);
  idat.write('IDAT', 4);
  compressedData.copy(idat, 8);
  const idatCrc = crc32(idat.slice(4, 8 + compressedData.length));
  idat.writeUInt32BE(idatCrc, 8 + compressedData.length);
  
  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

try {
  console.log('Creating PNG icons...');
  
  // Create 192x192 icon (dark blue)
  const icon192 = createSimplePNG(192, 192, '#1f2937');
  fs.writeFileSync('./public/icon-192.png', icon192);
  console.log('✅ Created icon-192.png');
  
  // Create 512x512 icon (dark blue)
  const icon512 = createSimplePNG(512, 512, '#1f2937');
  fs.writeFileSync('./public/icon-512.png', icon512);
  console.log('✅ Created icon-512.png');
  
  console.log('🎉 PNG icons created successfully!');
  
} catch (error) {
  console.error('❌ Error creating icons:', error.message);
  
  // Fallback: Create minimal valid PNG files using base64
  console.log('📝 Creating fallback icons...');
  
  // 1x1 blue pixel PNG encoded in base64
  const minimalPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(minimalPNG, 'base64');
  
  fs.writeFileSync('./public/icon-192.png', pngBuffer);
  fs.writeFileSync('./public/icon-512.png', pngBuffer);
  
  console.log('✅ Fallback icons created');
}
