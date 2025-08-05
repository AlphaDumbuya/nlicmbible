// Google Drive folder containing all audio files
// Permission: Everyone with the link can view
export const GOOGLE_DRIVE_FOLDER_ID = '13IFoqKYZrgoMPGGR2IQAdck70-YMN9ya';

// Base URLs for Google Drive
export const GOOGLE_DRIVE_BASE_URL = 'https://drive.google.com/uc?export=download&id=';
export const GOOGLE_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`;

// Function to get direct download URL for a file ID
export const getGoogleDriveDownloadUrl = (fileId: string) => `${GOOGLE_DRIVE_BASE_URL}${fileId}`;

// Function to get the folder URL for a specific book
export const getBookFolderUrl = (bookName: string) => {
    // Remove spaces and special characters from book name
    const formattedBookName = bookName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    return `${GOOGLE_DRIVE_FOLDER_URL}/${formattedBookName}`;
};
