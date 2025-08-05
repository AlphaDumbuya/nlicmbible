const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Google Drive folder ID where all the audio files are stored
const FOLDER_ID = '13IFoqKYZrgoMPGGR2IQAdck70-YMN9ya';

// Map between display names (from bible.ts) and folder names (in Google Drive)
const BOOK_MAPPING = {
  // Old Testament
  'Genesis': 'Genesis',
  'Exodus': 'Exodus',
  'Leviticus': 'Leviticus',
  'Numbers': 'Numbers',
  'Deuteronomy': 'Deuteronomy',
  'Joshua': 'Joshua',
  'Judges': 'Judges',
  'Ruth': 'Ruth',
  '1 Samuel': '1Samuel',
  '2 Samuel': '2Samuel',
  '1 Kings': '1Kings',
  '2 Kings': '2Kings',
  '1 Chronicles': '1Chronicles',
  '2 Chronicles': '2Chronicles',
  'Ezra': 'Ezra',
  'Nehemiah': 'Nehemiah',
  'Esther': 'Esther',
  'Job': 'Job',
  'Psalms': 'Psalms',
  'Proverbs': 'Proverbs',
  'Ecclesiastes': 'Ecclesiastes',
  'Song of Solomon': 'SongofSolomon',
  'Isaiah': 'Isaiah',
  'Jeremiah': 'Jeremiah',
  'Lamentations': 'Lamentations',
  'Ezekiel': 'Ezekiel',
  'Daniel': 'Daniel',
  'Hosea': 'Hosea',
  'Joel': 'Joel',
  'Amos': 'Amos',
  'Obadiah': 'Obadiah',
  'Jonah': 'Jonah',
  'Micah': 'Micah',
  'Nahum': 'Nahum',
  'Habakkuk': 'Habakkuk',
  'Zephaniah': 'Zephaniah',
  'Haggai': 'Haggai',
  'Zechariah': 'Zechariah',
  'Malachi': 'Malachi',
  
  // New Testament
  'Matthew': 'Matthew',
  'Mark': 'Mark',
  'Luke': 'Luke',
  'John': 'John',
  'Acts': 'Acts',
  'Romans': 'Romans',
  '1 Corinthians': '1Corinthians',
  '2 Corinthians': '2Corinthians',
  'Galatians': 'Galatians',
  'Ephesians': 'Ephesians',
  'Philippians': 'Philippians',
  'Colossians': 'Colossians',
  '1 Thessalonians': '1Thessalonians',
  '2 Thessalonians': '2Thessalonians',
  '1 Timothy': '1Timothy',
  '2 Timothy': '2Timothy',
  'Titus': 'Titus',
  'Philemon': 'Philemon',
  'Hebrews': 'Hebrews',
  'James': 'James',
  '1 Peter': '1Peter',
  '2 Peter': '2Peter',
  '1 John': '1John',
  '2 John': '2John',
  '3 John': '3John',
  'Jude': 'Jude',
  'Revelation': 'Revelation'
};

// Reverse mapping for folder names to display names
const FOLDER_TO_BOOK = Object.entries(BOOK_MAPPING).reduce((acc, [display, folder]) => {
  acc[folder] = display;
  return acc;
}, {});

async function getGoogleDriveService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const driveService = google.drive({ version: 'v3', auth });
  return driveService;
}

async function listAudioFiles(driveService, folderId) {
  const result = {};
  let pageToken = null;

  try {
    do {
      const response = await driveService.files.list({
        q: `'${folderId}' in parents and mimeType contains 'audio/' and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        orderBy: 'name',
        pageToken: pageToken,
      });

      const files = response.data.files;
      for (const file of files) {
        // Extract chapter number from filename (e.g., "1.mp3" or "1 .mp3")
        const match = file.name.match(/(\d+)/);
        if (match) {
          const chapterNum = parseInt(match[1], 10);
          result[chapterNum] = { id: file.id, chapter: chapterNum };
        }
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);
  } catch (error) {
    console.error('Error listing audio files:', error);
  }

  return result;
}

async function listFilesInFolder(driveService, folderId) {
  try {
    const result = {};
    let pageToken = null;

    do {
      const response = await driveService.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageToken: pageToken,
      });

      const files = response.data.files;
      for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // This is a book folder
          const folderName = file.name;
          const bookName = FOLDER_TO_BOOK[folderName];
          if (bookName) {
            console.log(`Processing ${bookName}...`);
            // Get all audio files in this book folder
            const chapters = await listAudioFiles(driveService, file.id);
            result[bookName] = chapters;
          }
        }
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return result;
  } catch (error) {
    console.error('Error listing folders:', error);
    return {};
  }
}

async function generateAudioMapping() {
  try {
    console.log('Starting audio mapping generation...');
    const drive = await getGoogleDriveService();
    const audioMapping = await listFilesInFolder(drive, FOLDER_ID);

    // Generate TypeScript file content
    const tsContent = `// Auto-generated file mapping for Google Drive audio files
// Maps book names to their chapters and corresponding Google Drive file IDs
export interface AudioFile {
  id: string;
  chapter: number;
}

export interface BookAudioFiles {
  [chapter: number]: AudioFile;
}

export const audioFiles: { [book: string]: BookAudioFiles } = ${JSON.stringify(audioMapping, null, 2)};
`;

    // Write to audioFiles.ts
    await fs.writeFile(
      path.join(__dirname, '../constants/audioFiles.ts'),
      tsContent
    );

    console.log('Audio mapping has been generated successfully!');
  } catch (error) {
    console.error('Error generating audio mapping:', error);
  }
}

// Run the script
generateAudioMapping();
