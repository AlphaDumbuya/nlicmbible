const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const FOLDER_ID = '13IFoqKYZrgoMPGGR2IQAdck70-YMN9ya';

// Split books into chunks (Old Testament first 10 books)
const BOOKS_TO_PROCESS = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel'
];

async function getAuthClient() {
  try {
    console.log('Reading credentials...');
    const key = require('./credentials.json');
    
    console.log('Creating auth client...');
    const client = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/drive.readonly']
    );

    console.log('Authorizing client...');
    await client.authorize();
    console.log('Auth client ready');
    return client;
  } catch (error) {
    console.error('Auth error details:', error);
    throw error;
  }
}

async function listFilesInFolder(auth, folderId) {
  const drive = google.drive({ version: 'v3', auth });
  const files = {};

  async function getFiles(folderId) {
    let pageToken = null;
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageToken: pageToken,
      });

      for (const file of response.data.files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // It's a folder (book)
          const bookName = file.name;
          // Only process books in our list
          if (BOOKS_TO_PROCESS.includes(bookName)) {
            console.log(`Processing book: ${bookName}`);
            files[bookName] = {};
            await getFiles(file.id); // Recursively get files in the book folder
          }
        } else {
          // It's a file (chapter)
          const parentFolder = await drive.files.get({
            fileId: folderId,
            fields: 'name',
          });
          const bookName = parentFolder.data.name;
          const chapterNum = parseInt(path.parse(file.name).name);
          if (!isNaN(chapterNum)) {
            if (!files[bookName]) {
              files[bookName] = {};
            }
            files[bookName][chapterNum] = { id: file.id };
          }
        }
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken);
  }

  await getFiles(folderId);
  return files;
}

async function generateTypeScriptFile(files) {
  const content = `interface AudioFileData {
  id: string;  // Google Drive file ID
}

interface AudioChapters {
  [chapter: number]: AudioFileData;
}

interface AudioFiles {
  [bookName: string]: AudioChapters;
}

// This mapping contains the Google Drive file IDs for each audio file
export const audioFiles: AudioFiles = ${JSON.stringify(files, null, 2)};
`;

  await fs.writeFile('./src/constants/audioFiles.ts', content);
  console.log('Generated audioFiles.ts');
}

async function main() {
  try {
    console.log('Starting script...');
    const auth = await getAuthClient();
    console.log('Getting files from Drive...');
    const files = await listFilesInFolder(auth, FOLDER_ID);
    console.log('Generating TypeScript file...');
    await generateTypeScriptFile(files);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
