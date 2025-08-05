interface AudioFileData {
  id: string;  // Google Drive file ID
}

interface AudioChapters {
  [chapter: number]: AudioFileData;
}

interface AudioFiles {
  [bookName: string]: AudioChapters;
}

// This mapping should contain the Google Drive file IDs for each audio file
export const audioFiles: AudioFiles = {
  "Genesis": {
    1: { id: "YOUR_GOOGLE_DRIVE_FILE_ID_HERE" },
    // Add other chapters here
  },
  // Add other books here
};
