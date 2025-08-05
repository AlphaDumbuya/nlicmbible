const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../assets/audio');
const outputFile = path.join(__dirname, '../src/constants/audioAssets.ts');

// Book name mapping for special cases
const bookNameMapping = {
  '1Corinthians': '1 Corinthians',
  '2Corinthians': '2 Corinthians',
  '1Thessalonians': '1 Thessalonians',
  '2Thessalonians': '2 Thessalonians',
  '1Timothy': '1 Timothy',
  '2Timothy': '2 Timothy',
  '1Peter': '1 Peter',
  '2Peter': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  '1Samuel': '1 Samuel',
  '2Samuel': '2 Samuel',
  '1Kings': '1 Kings',
  '2Kings': '2 Kings',
  '1Chronicles': '1 Chronicles',
  '2Chronicles': '2 Chronicles',
  'SongofSolomon': 'Song of Solomon'
};

function generateAudioAssets() {
  // TypeScript interfaces
  let output = `interface AudioChapters {
  [chapter: number]: any;
}

interface AudioBooks {
  [bookName: string]: AudioChapters;
}

export const audioAssets: AudioBooks = {
`;

  // Read all book directories
  const books = fs.readdirSync(audioDir)
    .filter(file => fs.statSync(path.join(audioDir, file)).isDirectory())
    .sort();

  books.forEach((book, bookIndex) => {
    const bookPath = path.join(audioDir, book);
    const chapters = fs.readdirSync(bookPath)
      .filter(file => file.endsWith('.mp3'))
      .map(file => {
        const num = parseInt(file.replace('.mp3', ''), 10);
        if (isNaN(num)) {
          console.warn(`Warning: Invalid chapter number in file ${file} for book ${book}`);
          return null;
        }
        return num;
      })
      .filter(num => num !== null)
      .sort((a, b) => a - b);

    const displayName = bookNameMapping[book] || book;
    
    output += `  "${displayName}": {\n`;
    chapters.forEach((chapter, chapterIndex) => {
      output += `    ${chapter}: require('../../assets/audio/${book}/${chapter}.mp3')${chapterIndex < chapters.length - 1 ? ',' : ''}\n`;
    });
    output += `  }${bookIndex < books.length - 1 ? ',' : ''}\n`;
  });

  output += `};\n\n`;

  // Add the getAudioAsset function
  output += `export const getAudioAsset = (bookName: string, chapter: number) => {
  try {
    // Try to normalize the book name by removing spaces and special characters
    const normalizedName = bookName.replace(/\\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    console.log('Looking for book:', bookName);
    console.log('Normalized book name:', normalizedName);
    console.log('Looking for chapter:', chapter);
    console.log('Available books:', Object.keys(audioAssets));

    // First try with the original name
    let book = audioAssets[bookName];
    if (!book) {
      // If not found, try with the normalized name
      book = audioAssets[normalizedName];
    }

    if (book && book[chapter]) {
      console.log('Found audio file for', bookName, 'chapter', chapter);
      return book[chapter];
    } else {
      console.log('Audio file not found for', bookName, 'chapter', chapter);
      if (book) {
        console.log('Available chapters:', Object.keys(book));
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting audio asset:', error);
    console.error('Book:', bookName, 'Chapter:', chapter);
    return null;
  }
};
`;

  // Write the output file
  fs.writeFileSync(outputFile, output);
  console.log('Generated audioAssets.ts successfully!');
  console.log('Found books:', books);
}

generateAudioAssets();
