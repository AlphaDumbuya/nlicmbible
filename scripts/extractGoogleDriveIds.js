const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

// Google Drive folder ID where all the audio files are stored
const FOLDER_ID = '13IFoqKYZrgoMPGGR2IQAdck70-YMN9ya';

// Book names mapping (add more as needed)
const BOOK_FOLDERS = {
  'Genesis': true,
  'Exodus': true,
  'Leviticus': true,
  // Add all book names here...
};

async function getGoogleDriveService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials.json'), // You'll need to add this
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
          const bookName = file.name;
          if (BOOK_FOLDERS[bookName]) {
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
    const drive = await getGoogleDriveService();
    const audioMapping = await listFilesInFolder(drive, FOLDER_ID);

    // Generate TypeScript file content
    const tsContent = `// Auto-generated file mapping for Google Drive audio files
import { BookAudioFiles } from './types';

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
