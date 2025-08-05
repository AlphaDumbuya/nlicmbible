import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { getAudioAsset } from '../../src/constants/audioAssets';
import useRecentItems from '../../src/hooks/useRecentItems';

export default function Favorites() {
  const [favorites, setFavorites] = useState<{book: string, chapter: number}[]>([]);
  const router = useRouter();

  // Audio state for handling playback
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{book: string, chapter: number} | null>(null);

  // Initialize audio
  useEffect(() => {
    async function initAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    }
    initAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await AsyncStorage.getItem('favorites');
        if (favs) setFavorites(JSON.parse(favs));
      } catch {}
    };
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (book: string, chapter: number) => {
    const newFavorites = favorites.filter(f => !(f.book === book && f.chapter === chapter));
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const { addToRecentItems } = useRecentItems();
  
  const handlePlayPause = async (book: string, chapter: number) => {
    try {
      // If the same item is playing, just toggle play/pause
      if (currentlyPlaying?.book === book && currentlyPlaying?.chapter === chapter && sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Add to recent items when starting new audio
      await addToRecentItems(book, chapter, 'favorites');

      // Unload any existing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Get the audio file and create new Sound object
      const audioAsset = getAudioAsset(book, chapter);
      const soundObject = new Audio.Sound();
      
      // Load and play immediately
      await soundObject.loadAsync(audioAsset, {
        shouldPlay: true, // Auto-play when loaded
      });
      
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });

      setSound(soundObject);
      setCurrentlyPlaying({ book, chapter });
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>

      {favorites.length > 0 ? (
        <ScrollView style={styles.favoritesList}>
          {favorites.map((favorite, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.favoriteItem}
              onPress={() => handlePlayPause(favorite.book, favorite.chapter)}
            >
              <View>
                <Text style={styles.bookTitle}>{favorite.book}</Text>
                <Text style={styles.chapterText}>Chapter {favorite.chapter}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handlePlayPause(favorite.book, favorite.chapter)}
                >
                  <Icon 
                    name={currentlyPlaying?.book === favorite.book && 
                         currentlyPlaying?.chapter === favorite.chapter && 
                         isPlaying ? "pause-circle" : "play-circle"} 
                    size={24} 
                    color="#ff8c00" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleRemoveFavorite(favorite.book, favorite.chapter)}
                >
                  <Icon name="heart" size={24} color="#ff8c00" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="heart-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No favorites yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add chapters to your favorites while listening
          </Text>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  favoritesList: {
    flex: 1,
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chapterText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
