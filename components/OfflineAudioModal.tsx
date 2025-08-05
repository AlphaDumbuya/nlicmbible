import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import bible from '../app/constants/bible';

interface Book {
  name: string;
  chapters: number;
}

interface OfflineAudioModalProps {
  onClose: () => void;
  cacheStatus: {
    totalSize: number;
    cachedBooks: { [book: string]: number[] };
    isOnline: boolean;
  };
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  preloadBook: (book: string) => Promise<void>;
  removeBookFromCache: (book: string) => Promise<void>;
  clearAllCache: () => Promise<void>;
  formatSize: (bytes: number) => string;
}

export default function OfflineAudioModal({
  onClose,
  cacheStatus,
  isLoading,
  refreshing,
  onRefresh,
  preloadBook,
  removeBookFromCache,
  clearAllCache,
  formatSize,
}: OfflineAudioModalProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Offline Audio</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {cacheStatus.isOnline ? (
            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Online</Text>
          ) : (
            <Text style={[styles.statusText, { color: '#f44336' }]}>Offline</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Storage Used</Text>
              <Text style={styles.settingDescription}>
                {formatSize(cacheStatus.totalSize)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear All Cache',
                  'Are you sure you want to remove all downloaded audio files?',
                  [
                    { text: 'Cancel', style: 'cancel' },
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
                      },
                    },
                  ]
                );
              }}
              style={styles.iconButton}
            >
              <Icon name="trash-outline" size={24} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Old Testament</Text>
          {bible.oldTestament.map((book: Book) => (
            <View key={book.name} style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>{book.name}</Text>
                <Text style={styles.settingDescription}>
                  {(cacheStatus.cachedBooks[book.name] || []).length} /{' '}
                  {book.chapters} chapters
                </Text>
              </View>
              {isLoading ? (
                <ActivityIndicator />
              ) : (cacheStatus.cachedBooks[book.name]?.length || 0) ===
                book.chapters ? (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await removeBookFromCache(book.name);
                      Alert.alert('Success', `${book.name} has been removed.`);
                    } catch (error) {
                      Alert.alert('Error', `Failed to remove ${book.name}.`);
                    }
                  }}
                  style={[styles.button, { backgroundColor: '#f44336' }]}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await preloadBook(book.name);
                      Alert.alert('Success', `${book.name} has been downloaded.`);
                    } catch (error) {
                      Alert.alert('Error', `Failed to download ${book.name}.`);
                    }
                  }}
                  style={[styles.button, { backgroundColor: '#FF8C00' }]}
                >
                  <Text style={styles.buttonText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Testament</Text>
          {bible.newTestament.map((book: Book) => (
            <View key={book.name} style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>{book.name}</Text>
                <Text style={styles.settingDescription}>
                  {(cacheStatus.cachedBooks[book.name] || []).length} /{' '}
                  {book.chapters} chapters
                </Text>
              </View>
              {isLoading ? (
                <ActivityIndicator />
              ) : (cacheStatus.cachedBooks[book.name]?.length || 0) ===
                book.chapters ? (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await removeBookFromCache(book.name);
                      Alert.alert('Success', `${book.name} has been removed.`);
                    } catch (error) {
                      Alert.alert('Error', `Failed to remove ${book.name}.`);
                    }
                  }}
                  style={[styles.button, { backgroundColor: '#f44336' }]}
                >
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await preloadBook(book.name);
                      Alert.alert('Success', `${book.name} has been downloaded.`);
                    } catch (error) {
                      Alert.alert('Error', `Failed to download ${book.name}.`);
                    }
                  }}
                  style={[styles.button, { backgroundColor: '#FF8C00' }]}
                >
                  <Text style={styles.buttonText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 12,
    borderRadius: 24,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 72,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
