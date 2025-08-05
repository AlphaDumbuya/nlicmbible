import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentItem {
  book: string;
  chapter: number;
  timestamp: number;
  source: 'home' | 'favorites' | 'library';
  lastPosition?: number;
}

const useRecentItems = () => {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  const loadRecentItems = async () => {
    try {
      const recentItemsJson = await AsyncStorage.getItem('recentItems');
      const items = recentItemsJson ? JSON.parse(recentItemsJson) : [];
      setRecentItems(items);
    } catch (error) {
      console.error('Error loading recent items:', error);
      setRecentItems([]);
    }
  };

  const clearRecentItems = async () => {
    try {
      await AsyncStorage.removeItem('recentItems');
      setRecentItems([]);
      const check = await AsyncStorage.getItem('recentItems');
      if (check !== null) {
        await AsyncStorage.setItem('recentItems', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error clearing recent items:', error);
    }
  };

  const addToRecentItems = async (book: string, chapter: number, source: RecentItem['source'], lastPosition?: number) => {
    try {
      const newItem: RecentItem = {
        book,
        chapter,
        timestamp: Date.now(),
        source,
        lastPosition,
      };

      const existingItemsJson = await AsyncStorage.getItem('recentItems');
      const existingItems = existingItemsJson ? JSON.parse(existingItemsJson) : [];
      
      const filteredItems = existingItems.filter(
        (item: RecentItem) => !(item.book === book && item.chapter === chapter)
      );
      
      const updatedItems = [newItem, ...filteredItems].slice(0, 50);
      
      await AsyncStorage.setItem('recentItems', JSON.stringify(updatedItems));
      setRecentItems(updatedItems);
      
      await loadRecentItems();
    } catch (error) {
      console.error('Error adding recent item:', error);
    }
  };

  useEffect(() => {
    loadRecentItems();
  }, []);

  return {
    recentItems,
    addToRecentItems,
    loadRecentItems,
    clearRecentItems,
  };
};

export default useRecentItems;
