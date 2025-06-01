const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background with rounded corners effect
    ctx.fillStyle = '#1f2937'; // Dark gray
    ctx.fillRect(0, 0, size, size);
    
    // Add some visual elements to represent a book/reader
    // Book icon
    const bookWidth = size * 0.6;
    const bookHeight = size * 0.45;
    const bookX = (size - bookWidth) / 2;
    const bookY = (size - bookHeight) / 2;
    
    // Book cover
    ctx.fillStyle = '#3b82f6'; // Blue
    ctx.fillRect(bookX, bookY, bookWidth, bookHeight);
    
    // Book pages
    ctx.fillStyle = '#f8fafc'; // Light gray
    ctx.fillRect(bookX + size * 0.02, bookY + size * 0.02, bookWidth - size * 0.04, bookHeight - size * 0.04);
    
    // Text lines
    const lineHeight = size * 0.025;
    const lineMargin = size * 0.05;
    ctx.fillStyle = '#64748b'; // Gray text
    
    for (let i = 0; i < 4; i++) {
        const lineY = bookY + lineMargin + (i * lineHeight * 1.5);
        const lineWidth = bookWidth - (lineMargin * 2);
        ctx.fillRect(bookX + lineMargin, lineY, lineWidth * (0.7 + Math.random() * 0.3), lineHeight);
    }
    
    // Convert to PNG buffer
    return canvas.toBuffer('image/png');
}

try {
    // Generate 192x192 icon
    const icon192 = generateIcon(192);
    fs.writeFileSync('./public/icon-192.png', icon192);
    console.log('Generated icon-192.png');
    
    // Generate 512x512 icon
    const icon512 = generateIcon(512);
    fs.writeFileSync('./public/icon-512.png', icon512);
    console.log('Generated icon-512.png');
    
    console.log('Icons generated successfully!');
} catch (error) {
    console.error('Error generating icons:', error.message);
    console.log('Canvas package might not be installed. Creating simple placeholder PNGs...');
    
    // Create placeholder text files if canvas is not available
    const placeholder192 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const placeholder512 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    console.log('Please manually create icon-192.png and icon-512.png files.');
}
