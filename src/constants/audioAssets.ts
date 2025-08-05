import { audioFiles } from './audioFiles';
import { GOOGLE_DRIVE_BASE_URL } from './config';

interface AudioChapters {
  [chapter: number]: string;  // URL to the audio file
}

interface AudioBooks {
  [bookName: string]: AudioChapters;
}

// Convert audioFiles mapping to direct download URLs
const audioAssets: AudioBooks = Object.entries(audioFiles).reduce((books, [bookName, chapters]) => {
  books[bookName] = Object.entries(chapters).reduce((chapterUrls, [chapter, data]) => {
    chapterUrls[Number(chapter)] = `${GOOGLE_DRIVE_BASE_URL}${data.id}`;
    return chapterUrls;
  }, {});
  return books;
}, {});

export const getAudioAsset = (bookName: string, chapter: number) => {
  try {
    // Try to normalize the book name by removing spaces and special characters
    const normalizedName = bookName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
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
