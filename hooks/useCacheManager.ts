import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AudioCache } from '../services/AudioCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheStatus {
  totalSize: number;
  cachedBooks: { [book: string]: number[] }; // book name -> cached chapters
  isOnline: boolean;
}

const CACHE_STATUS_KEY = '@audio_cache_status';

export function useCacheManager() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    totalSize: 0,
    cachedBooks: {},
    isOnline: true
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load cache status on mount
  useEffect(() => {
    loadCacheStatus();
    setupNetworkListener();
  }, []);

  // Set up network connectivity listener
  const setupNetworkListener = () => {
    return NetInfo.addEventListener(state => {
      setCacheStatus(prev => ({
        ...prev,
        isOnline: state.isConnected ?? true
      }));
    });
  };

  // Load cache status from storage
  const loadCacheStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(CACHE_STATUS_KEY);
      if (stored) {
        setCacheStatus(prev => ({
          ...JSON.parse(stored),
          isOnline: prev.isOnline
        }));
      }
      await updateCacheStatus();
    } catch (error) {
      console.error('Error loading cache status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update and save cache status
  const updateCacheStatus = async () => {
    try {
      setIsLoading(true);
      const size = await AudioCache.getCacheSize();
      const books = await AudioCache.getCachedBooks();
      
      const newStatus: CacheStatus = {
        ...cacheStatus,
        totalSize: size,
        cachedBooks: books
      };
      
      setCacheStatus(newStatus);
      await AsyncStorage.setItem(CACHE_STATUS_KEY, JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error updating cache status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-cache a book
  const preloadBook = async (book: string) => {
    if (!cacheStatus.isOnline) {
      throw new Error('Cannot preload while offline');
    }

    try {
      setIsLoading(true);
      await AudioCache.preloadBook(book);
      await updateCacheStatus();
    } catch (error) {
      console.error(`Error preloading book ${book}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a book from cache
  const removeBookFromCache = async (book: string) => {
    try {
      setIsLoading(true);
      await AudioCache.clearBookCache(book);
      await updateCacheStatus();
    } catch (error) {
      console.error(`Error removing book ${book} from cache:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all cached audio
  const clearAllCache = async () => {
    try {
      setIsLoading(true);
      await AudioCache.clearAllCache();
      await updateCacheStatus();
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cacheStatus,
    isLoading,
    updateCacheStatus,
    preloadBook,
    removeBookFromCache,
    clearAllCache,
    formatSize: AudioCache.formatSize
  };
}
