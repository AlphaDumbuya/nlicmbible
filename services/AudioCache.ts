import * as FileSystem from 'expo-file-system';
import { audioFiles } from '../constants/audioFiles';
import { Alert } from 'react-native';
import bible from '../app/constants/bible';
import NetInfo from '@react-native-community/netinfo';

const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio-cache/`;

export interface AudioCacheInfo {
  localUri: string;
  timestamp: number;
}

// Cache duration - 30 days in milliseconds
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

export const AudioCache = {
  async init() {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
    }
  },

  getCacheKey(book: string, chapter: number): string {
    return `${book}-${chapter}`;
  },

  async getCachedUri(book: string, chapter: number): Promise<string | null> {
    const cacheKey = this.getCacheKey(book, chapter);
    const cachePath = `${AUDIO_CACHE_DIR}${cacheKey}.mp3`;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(cachePath);
      if (!fileInfo.exists) {
        return null;
      }

      // Check if cache is older than 30 days
      const metadata = await this.getCacheMetadata(cacheKey);
      if (metadata && Date.now() - metadata.timestamp > CACHE_DURATION) {
        await this.clearCache(book, chapter);
        return null;
      }

      return fileInfo.uri;
    } catch (error) {
      console.error('Error checking cache:', error);
      return null;
    }
  },

  async cacheAudio(book: string, chapter: number): Promise<string> {
    try {
      const bookFiles = audioFiles[book];
      if (!bookFiles || !bookFiles[chapter]) {
        throw new Error(`Audio not found for ${book} chapter ${chapter}`);
      }

      // Ensure cache directory exists
      await this.init();

      const fileId = bookFiles[chapter].id;
      // Using a direct download link format
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const cacheKey = this.getCacheKey(book, chapter);
      const cachePath = `${AUDIO_CACHE_DIR}${cacheKey}.mp3`;

      console.log(`Downloading ${book} chapter ${chapter}`);

      const downloadOptions = {
        timeoutInterval: 30000, // 30 second timeout
        headers: {
          'Accept': 'audio/mpeg',
        }
      };

      const { uri, status } = await FileSystem.downloadAsync(downloadUrl, cachePath, downloadOptions);
      
      if (status !== 200) {
        throw new Error(`Download failed with status ${status}`);
      }

      // Verify file exists and has size
      const fileInfo = await FileSystem.getInfoAsync(cachePath);
      if (!fileInfo.exists || (fileInfo.size && fileInfo.size === 0)) {
        throw new Error('Downloaded file is empty or does not exist');
      }

      await this.saveCacheMetadata(cacheKey, { localUri: uri, timestamp: Date.now() });
      return uri;
    } catch (error) {
      console.error('Error caching audio:', error);
      if (error instanceof Error) {
        Alert.alert('Download Error', `Failed to download ${book} chapter ${chapter}: ${error.message}`);
      } else {
        Alert.alert('Download Error', `Failed to download ${book} chapter ${chapter}`);
      }
      throw error;
    }
  },

  async clearCache(book: string, chapter: number) {
    const cacheKey = this.getCacheKey(book, chapter);
    const cachePath = `${AUDIO_CACHE_DIR}${cacheKey}.mp3`;
    try {
      await FileSystem.deleteAsync(cachePath, { idempotent: true });
      await this.clearCacheMetadata(cacheKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  async clearAllCache() {
    try {
      await FileSystem.deleteAsync(AUDIO_CACHE_DIR, { idempotent: true });
      await this.init();
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  },

  async preloadBook(book: string) {
    const allBooks = [...bible.oldTestament, ...bible.newTestament];
    const bookData = allBooks.find(b => b.name === book);
    if (!bookData) {
      throw new Error(`Book ${book} not found`);
    }

    try {
      // First verify network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        Alert.alert('Error', 'No internet connection available. Please check your connection and try again.');
        throw new Error('No internet connection available');
      }

      // Create progress alert with cancel option
      let isCancelled = false;
      Alert.alert(
        'Downloading',
        `Starting download of ${book}...`,
        [
          { 
            text: 'Cancel',
            onPress: () => { isCancelled = true; }
          },
          { text: 'OK' }
        ]
      );

      for (let chapter = 1; chapter <= bookData.chapters; chapter++) {
        if (isCancelled) {
          throw new Error('Download cancelled');
        }

        try {
          await this.cacheAudio(book, chapter);
          // Update progress
          if (chapter % 5 === 0 || chapter === bookData.chapters) {
            Alert.alert(
              'Download Progress',
              `Downloaded ${chapter} of ${bookData.chapters} chapters`,
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error(`Error downloading chapter ${chapter}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          Alert.alert('Download Error', `Failed to download chapter ${chapter}. ${errorMessage}`);
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error preloading ${book}:`, error);
      throw error;
    }
  },

  async clearBookCache(book: string) {
    const allBooks = [...bible.oldTestament, ...bible.newTestament];
    const bookData = allBooks.find(b => b.name === book);
    if (!bookData) {
      throw new Error(`Book ${book} not found`);
    }

    try {
      for (let chapter = 1; chapter <= bookData.chapters; chapter++) {
        await this.clearCache(book, chapter);
      }
    } catch (error) {
      console.error(`Error clearing cache for ${book}:`, error);
      throw error;
    }
  },

  async getCachedBooks(): Promise<{ [book: string]: number[] }> {
    try {
      const files = await FileSystem.readDirectoryAsync(AUDIO_CACHE_DIR);
      const cachedBooks: { [book: string]: number[] } = {};

      for (const file of files) {
        if (!file.endsWith('.mp3')) continue;

        const match = file.match(/^(.+)-(\d+)\.mp3$/);
        if (match) {
          const [, book, chapterStr] = match;
          const chapter = parseInt(chapterStr, 10);
          
          if (!cachedBooks[book]) {
            cachedBooks[book] = [];
          }
          cachedBooks[book].push(chapter);
        }
      }

      return cachedBooks;
    } catch (error) {
      console.error('Error getting cached books:', error);
      return {};
    }
  },

  async getCacheMetadata(cacheKey: string): Promise<AudioCacheInfo | null> {
    try {
      const metadataPath = `${AUDIO_CACHE_DIR}${cacheKey}.json`;
      const metadataStr = await FileSystem.readAsStringAsync(metadataPath);
      return JSON.parse(metadataStr);
    } catch {
      return null;
    }
  },

  async saveCacheMetadata(cacheKey: string, info: AudioCacheInfo) {
    const metadataPath = `${AUDIO_CACHE_DIR}${cacheKey}.json`;
    await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(info));
  },

  async clearCacheMetadata(cacheKey: string) {
    const metadataPath = `${AUDIO_CACHE_DIR}${cacheKey}.json`;
    await FileSystem.deleteAsync(metadataPath, { idempotent: true });
  },

  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(AUDIO_CACHE_DIR);
      let totalSize = 0;
      
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${AUDIO_CACHE_DIR}${file}`);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  },

  formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }
};
