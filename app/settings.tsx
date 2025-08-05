import React from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert, View, Text } from 'react-native';
import { useCacheManager } from '../hooks/useCacheManager';
import bible from './constants/bible';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SettingsScreen() {
  const {
    cacheStatus,
    isLoading,
    updateCacheStatus,
    preloadBook,
    removeBookFromCache,
    clearAllCache,
    formatSize
  } = useCacheManager();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await updateCacheStatus();
    setRefreshing(false);
  }, [updateCacheStatus]);

  const handlePreloadBook = async (book: string) => {
    try {
      await preloadBook(book);
      Alert.alert('Success', `${book} has been downloaded for offline use.`);
    } catch (error) {
      Alert.alert('Error', `Failed to download ${book}. Please try again.`);
    }
  };

  const handleRemoveBook = async (book: string) => {
    try {
      await removeBookFromCache(book);
      Alert.alert('Success', `${book} has been removed from offline storage.`);
    } catch (error) {
      Alert.alert('Error', `Failed to remove ${book}. Please try again.`);
    }
  };

  const handleClearAllCache = async () => {
    Alert.alert(
      'Clear All Cache',
      'Are you sure you want to remove all downloaded audio files?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllCache();
              Alert.alert('Success', 'All cached audio files have been removed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderBook = (book: typeof bible.oldTestament[0]) => {
    const cachedChapters = cacheStatus.cachedBooks[book.name] || [];
    const isFullyCached = cachedChapters.length === book.chapters;
    const isCaching = isLoading;

    return (
      <View key={book.name} style={styles.bookItem}>
        <View style={styles.bookInfo}>
          <Text style={styles.bookName}>{book.name}</Text>
          <Text style={styles.bookDetails}>
            {cachedChapters.length} / {book.chapters} chapters downloaded
          </Text>
        </View>
        {isCaching ? (
          <ActivityIndicator />
        ) : isFullyCached ? (
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={() => handleRemoveBook(book.name)}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.downloadButton]}
            onPress={() => handlePreloadBook(book.name)}
          >
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Offline Storage</Text>
        <Text style={styles.subtitle}>
          {formatSize(cacheStatus.totalSize)} used
        </Text>
        {cacheStatus.isOnline ? (
          <Text style={styles.statusOnline}>Online</Text>
        ) : (
          <Text style={styles.statusOffline}>Offline</Text>
        )}
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAllCache}>
          <Text style={styles.clearButtonText}>Clear All Cache</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Old Testament</Text>
        {bible.oldTestament.map(renderBook)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Testament</Text>
        {bible.newTestament.map(renderBook)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  statusOnline: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusOffline: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '500',
  },
  bookDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButton: {
    backgroundColor: '#2196F3',
  },
  removeButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  clearButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
