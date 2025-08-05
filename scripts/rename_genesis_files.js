const fs = require('fs');
const path = require('path');

const genesisDir = path.join(__dirname, '../assets/audio/Genesis');

// Get all files in the Genesis directory
const files = fs.readdirSync(genesisDir);

// Sort files to ensure correct order
files.sort();

files.forEach(file => {
    if (file.endsWith('.mp3')) {
        // Extract the chapter number from the filename (it's between "A01___" and "_Genesis")
        const chapterNum = file.match(/A01___(\d+)_Genesis/)[1];
        
        // Remove leading zero from chapter number
        const newChapterNum = parseInt(chapterNum, 10);
        
        // Create the new filename
        const newFilename = `${newChapterNum}.mp3`;
        
        // Create the full paths
        const oldPath = path.join(genesisDir, file);
        const newPath = path.join(genesisDir, newFilename);
        
        // Rename the file
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${file} to ${newFilename}`);
    }
});

console.log('All Genesis files have been renamed successfully!');
