#!/bin/bash

# Simple script to create placeholder PNG icons using ImageMagick (if available)
# or download them from a placeholder service

echo "Creating PWA icons..."

# Check if ImageMagick is available
if command -v convert >/dev/null 2>&1; then
    echo "Using ImageMagick to generate icons..."
    
    # Generate 192x192 icon
    convert -size 192x192 canvas:#1f2937 \
        -fill "#3b82f6" -draw "rectangle 40,60 152,120" \
        -fill "#f8fafc" -draw "rectangle 42,62 150,118" \
        -fill "#64748b" -draw "rectangle 50,70 140,75" \
        -fill "#64748b" -draw "rectangle 50,80 135,85" \
        -fill "#64748b" -draw "rectangle 50,90 145,95" \
        -fill "#64748b" -draw "rectangle 50,100 130,105" \
        public/icon-192.png
    
    # Generate 512x512 icon
    convert -size 512x512 canvas:#1f2937 \
        -fill "#3b82f6" -draw "rectangle 100,160 412,320" \
        -fill "#f8fafc" -draw "rectangle 105,165 407,315" \
        -fill "#64748b" -draw "rectangle 120,180 380,200" \
        -fill "#64748b" -draw "rectangle 120,220 360,240" \
        -fill "#64748b" -draw "rectangle 120,260 390,280" \
        -fill "#64748b" -draw "rectangle 120,300 350,320" \
        public/icon-512.png
    
    echo "Icons generated successfully with ImageMagick!"
    
else
    echo "ImageMagick not found. Creating simple colored squares..."
    
    # Create simple colored squares using printf and base64
    # This creates a minimal 1x1 PNG that will be stretched
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=" | base64 -d > public/icon-192.png
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=" | base64 -d > public/icon-512.png
    
    echo "Basic placeholder icons created."
fi

echo "Icon generation complete!"
