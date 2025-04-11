const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { exec } = require('child_process');

// Ensure the public directory exists
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Convert the SVG favicon to PNG
const faviconSvgPath = path.join(publicDir, 'favicon.svg');
const faviconPngPath = path.join(publicDir, 'favicon.png');
const appleIconSvgPath = path.join(publicDir, 'apple-icon.svg');
const appleIconPngPath = path.join(publicDir, 'apple-icon.png');

// Check if SVG files exist
if (fs.existsSync(faviconSvgPath)) {
  console.log('Converting favicon SVG to PNG...');
  
  // Convert favicon SVG to PNG
  sharp(faviconSvgPath)
    .resize(32, 32)
    .png()
    .toFile(faviconPngPath)
    .then(() => {
      console.log('Favicon PNG created successfully.');
      
      // Convert PNG to ICO (Windows favicon)
      console.log('Converting PNG to ICO...');
      const icoCommand = `npx png-to-ico ${faviconPngPath} > ${path.join(publicDir, 'favicon.ico')}`;
      exec(icoCommand, (error) => {
        if (error) {
          console.error('Error creating ICO file:', error);
          
          // Fallback - just use the PNG as favicon.ico
          fs.copyFileSync(faviconPngPath, path.join(publicDir, 'favicon.ico'));
          console.log('Fallback: Used PNG as favicon.ico');
        } else {
          console.log('Favicon ICO created successfully.');
        }
      });
    })
    .catch(err => {
      console.error('Error creating favicon PNG:', err);
    });
}

// Convert apple icon SVG to PNG
if (fs.existsSync(appleIconSvgPath)) {
  console.log('Converting Apple icon SVG to PNG...');
  
  sharp(appleIconSvgPath)
    .resize(180, 180)
    .png()
    .toFile(appleIconPngPath)
    .then(() => {
      console.log('Apple icon PNG created successfully.');
    })
    .catch(err => {
      console.error('Error creating Apple icon PNG:', err);
    });
}

// If SVG files don't exist, use a fallback approach
if (!fs.existsSync(faviconSvgPath) || !fs.existsSync(appleIconSvgPath)) {
  console.log('SVG files not found. Creating basic icons...');
  
  // Create a basic blue square favicon
  const createBasicIcon = (size, outputPath) => {
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size/5}" fill="#3B82F6" />
      <text x="50%" y="50%" font-family="Arial" font-size="${size/2}" fill="white" text-anchor="middle" dominant-baseline="middle">CS</text>
    </svg>`;
    
    const svgBuffer = Buffer.from(svgContent);
    
    sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath)
      .then(() => {
        console.log(`Basic icon created at ${outputPath}`);
        
        // If creating favicon, also convert to ICO
        if (outputPath === faviconPngPath) {
          fs.copyFileSync(faviconPngPath, path.join(publicDir, 'favicon.ico'));
          console.log('Basic favicon.ico created.');
        }
      })
      .catch(err => {
        console.error(`Error creating basic icon for ${outputPath}:`, err);
      });
  };
  
  // Create basic icons
  if (!fs.existsSync(faviconSvgPath)) {
    createBasicIcon(32, faviconPngPath);
  }
  
  if (!fs.existsSync(appleIconSvgPath)) {
    createBasicIcon(180, appleIconPngPath);
  }
} 