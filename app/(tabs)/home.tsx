import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  GestureResponderEvent,
  LayoutChangeEvent,
  Alert,
  Image,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
  useWindowDimensions,
  ViewStyle
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// TODO: Migrate to expo-audio when SDK 54 is released and the package is more mature
import * as ExpoAV from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MinimalAudioPlayer from '../../components/MinimalAudioPlayer';
import Icon from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import { getAudioAsset } from '../../src/constants/audioAssets';
import { oldTestament, newTestament } from '../constants/bible';
import useRecentItems from '../../src/hooks/useRecentItems';


type Book = {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
};

const getResponsiveSize = (size: number) => {
  const { width, height } = Dimensions.get('window');
  const baseWidth = 375; // Base width (iPhone 8)
  const scale = width / baseWidth;
  return Math.round(size * scale);
};

export default function Page() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestament, setActiveTestament] = useState('old');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  
  // Audio player state
  const [sound, setSound] = useState<ExpoAV.Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.7);
  const [currentBook, setCurrentBook] = useState('');
  const [currentChapter, setCurrentChapter] = useState(0);
  const [autoNextChapter, setAutoNextChapter] = useState(true);
  const [favorites, setFavorites] = useState<{book: string, chapter: number}[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Refs for measuring component widths
  const progressBarWidth = useRef(0);
  const volumeBarWidth = useRef(0);

  // Update UI and handle playback from URL parameters
  useEffect(() => {
    const autoPlay = async () => {
      const playBook = params.playBook as string;
      const playChapter = parseInt(params.playChapter as string);

      if (playBook && !isNaN(playChapter)) {
        // Find the book and update UI state
        const book = [...oldTestament, ...newTestament].find(b => b.name === playBook);
        if (book) {
          // Update all book-related state
          setSelectedBook(book);
          setCurrentBook(book.name);
          setCurrentChapter(playChapter);
          setActiveTestament(book.testament);
          
          // Close selectors
          setShowBookSelector(false);
          setShowChapterSelector(false);
          
          // Update loading state and prepare for playback
          setIsLoading(true);
          
          // Unload any existing audio
          if (sound) {
            await sound.unloadAsync();
            setSound(null);
          }
          
          // Load and play the new audio
          await loadAudio(playBook, playChapter, true); // Set autoplay to true
        }
      }
    };

    if (params.playBook && params.playChapter) {
      autoPlay();
    }
  }, [params.playBook, params.playChapter]);

  // Load favorites from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await AsyncStorage.getItem('favorites');
        if (favs) setFavorites(JSON.parse(favs));
      } catch {}
    };
    loadFavorites();
  }, []);

  // Update isFavorite when book/chapter changes
  useEffect(() => {
    if (currentBook && currentChapter) {
      setIsFavorite(favorites.some(f => f.book === currentBook && f.chapter === currentChapter));
    } else {
      setIsFavorite(false);
    }
  }, [currentBook, currentChapter, favorites]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSetting = await AsyncStorage.getItem('autoNextChapter');
        if (savedSetting !== null) {
          setAutoNextChapter(savedSetting === 'true');
          console.log('Auto next chapter setting loaded:', savedSetting === 'true');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('autoNextChapter', autoNextChapter.toString());
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    saveSettings();
  }, [autoNextChapter]);

  const seekTo = async (position: number) => {
    if (!sound) return;
    try {
      await sound.setPositionAsync(Math.floor(position));
      setPosition(Math.floor(position));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleNextChapter = async () => {
    if (!selectedBook || currentChapter >= selectedBook.chapters) return;
    
    try {
      setIsLoading(true);
      // Make sure to unload current sound first
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      const nextChapter = currentChapter + 1;
      setCurrentChapter(nextChapter);
      
      // Load the new audio with autoplay
      await loadAudio(currentBook, nextChapter, true);
    } catch (error) {
      console.error('Error changing to next chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousChapter = async () => {
    if (currentChapter <= 1) return;
    
    try {
      setIsLoading(true);
      // Make sure to unload current sound first
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      const prevChapter = currentChapter - 1;
      setCurrentChapter(prevChapter);
      
      // Load the new audio with autoplay
      await loadAudio(currentBook, prevChapter, true);
    } catch (error) {
      console.error('Error changing to previous chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const handleVolumeChange = async (value: number) => {
    if (sound) {
      await sound.setVolumeAsync(value);
      setVolume(value);
    }
  };

  const handleSpeedChange = async (value: number) => {
    if (sound) {
      await sound.setRateAsync(value, true);
      setPlaybackSpeed(value);
    }
  };

  const { addToRecentItems } = useRecentItems();
  
  const loadAudio = async (book: string, chapter: number, autoplay = false) => {
    try {
      // Add to recent items when audio starts loading
      await addToRecentItems(book, chapter, 'home');

      // Get the audio file for the specified book and chapter
      const audioAsset = getAudioAsset(book, chapter);
      
      const soundObject = new ExpoAV.Audio.Sound();
      await soundObject.loadAsync(audioAsset, {
        progressUpdateIntervalMillis: 1000,
        shouldPlay: autoplay,
      });

      const status = await soundObject.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setPosition(0); // Reset position for new audio
        setSound(soundObject);
        
        soundObject.setOnPlaybackStatusUpdate((status: ExpoAV.AVPlaybackStatus) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish && autoNextChapter) {
              handleNextChapter();
            }
          }
        });

        // Now that everything is set up, play the audio
        await soundObject.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsPlaying(false);
      setSound(null);
      setDuration(0);
      setPosition(0);
    }
  };

  useEffect(() => {
    async function initAudio() {
      try {
        await ExpoAV.Audio.setAudioModeAsync({
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

  const handleToggleFavorite = async () => {
    if (!currentBook || !currentChapter) return;
    let newFavs;
    if (isFavorite) {
      newFavs = favorites.filter(f => !(f.book === currentBook && f.chapter === currentChapter));
    } else {
      newFavs = [...favorites, { book: currentBook, chapter: currentChapter }];
    }
    setFavorites(newFavs);
    setIsFavorite(!isFavorite);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image
              source={require('../../assets/images/nlicm-logo.jpg')}
              style={styles.logo}
            />
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>NLICM Krio Audio Bible</Text>
              <Text style={styles.subtitle}>
                The Living Word in Krio — Powered by New Life in Christ Ministry Kossoh Town Chapter
              </Text>
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#ff8c00" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by book name..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 0) {
                  setShowBookSelector(true);
                  setShowChapterSelector(false);
                  // Show all books when searching
                  const searchedBook = [...oldTestament, ...newTestament].find(
                    book => book.name.toLowerCase().includes(text.toLowerCase())
                  );
                  if (searchedBook) {
                    setActiveTestament(searchedBook.testament);
                  }
                } else {
                  setShowBookSelector(false);
                }
              }}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
              clearButtonMode="while-editing"
              selectionColor="#ff8c00"
              underlineColorAndroid="transparent"
              textAlignVertical="center"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bibleNavigation}>
          <View style={styles.testamentTabs}>
            <TouchableOpacity
              style={[styles.testamentTab, activeTestament === 'old' && styles.activeTabPurple]}
              onPress={() => {
                setActiveTestament('old');
                setSelectedBook(null);
                setCurrentBook('');
                setCurrentChapter(0);
                setShowBookSelector(false);
                setShowChapterSelector(false);
                if (sound) {
                  sound.unloadAsync();
                }
              }}
            >
              <Text style={[styles.testamentText, activeTestament === 'old' && styles.activeTestamentText]}>
                Old Testament
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testamentTab, activeTestament === 'new' && styles.activeTabPurple]}
              onPress={() => {
                setActiveTestament('new');
                setSelectedBook(null);
                setCurrentBook('');
                setCurrentChapter(0);
                setShowBookSelector(false);
                setShowChapterSelector(false);
                if (sound) {
                  sound.unloadAsync();
                }
              }}
            >
              <Text style={[styles.testamentText, activeTestament === 'new' && styles.activeTestamentText]}>
                New Testament
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectionInputs}>
            <View style={[styles.selectorContainer, { zIndex: 3 }]}>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => {
                  setShowBookSelector(true);
                  setShowChapterSelector(false);
                }}
              >
                <Text style={styles.selectInputText}>
                  {selectedBook?.name || 'Select Book'}
                </Text>
                <Icon name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              {showBookSelector && (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => {
                      setShowBookSelector(false);
                      setShowChapterSelector(false);
                    }}
                  />
                  <View style={styles.selectorModal}>
                    <ScrollView style={styles.modalContent}>
                      {(activeTestament === 'old' ? oldTestament : newTestament)
                        .filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(b => (
                          <TouchableOpacity
                            key={b.name}
                            activeOpacity={0.7}
                            style={[
                              styles.bookItem,
                              selectedBook?.name === b.name && styles.bookItemSelected
                            ]}
                            onPress={async () => {
                              try {
                                const newBook: Book = {
                                  name: b.name,
                                  chapters: b.chapters,
                                  testament: activeTestament as 'old' | 'new'
                                };
                                
                                setShowBookSelector(false);
                                setShowChapterSelector(false);
                                setSelectedBook(newBook);
                                setCurrentBook(b.name);
                                setCurrentChapter(1);
                                
                                if (sound) {
                                  await sound.unloadAsync();
                                  setSound(null);
                                }
                                
                                await loadAudio(b.name, 1);
                              } catch (error) {
                                console.error('Error selecting book:', error);
                                Alert.alert('Error', 'Failed to load the selected book.');
                              }
                            }}
                          >
                            <Text style={styles.bookText}>{b.name}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
            
            <View style={[{ flex: 1 }, styles.selectorContainer, { zIndex: 2 }]}>
              <TouchableOpacity
                style={[
                  styles.selectInput, 
                  !selectedBook && styles.selectInputDisabled
                ]}
                onPress={() => {
                  if (selectedBook) {
                    setShowChapterSelector(true);
                    setShowBookSelector(false);
                  }
                }}
              >
                <Text 
                  style={[
                    styles.selectInputText,
                    !selectedBook && styles.selectInputTextDisabled
                  ]}
                >
                  {selectedBook ? `Chapter ${currentChapter}` : 'Select Chapter'}
                </Text>
                <Icon 
                  name="chevron-down" 
                  size={20} 
                  color={selectedBook ? '#666' : '#999'} 
                />
              </TouchableOpacity>

              {showChapterSelector && selectedBook && (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowChapterSelector(false)}
                  />
                  <View style={styles.selectorModal}>
                    <ScrollView style={styles.modalContent}>
                      <View style={styles.chapterGrid}>
                        {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                          <TouchableOpacity
                            key={chapter}
                            style={[
                              styles.chapterButton,
                              currentChapter === chapter && styles.activeChapter,
                            ]}
                            onPress={async () => {
                              setCurrentChapter(chapter);
                              setShowChapterSelector(false);
                              await loadAudio(selectedBook.name, chapter);
                            }}
                          >
                            <Text style={[
                              styles.chapterButtonText,
                              currentChapter === chapter && { color: '#ff8c00' }
                            ]}>
                              Chapter {chapter}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.audioPlayerSection}>
          <View style={styles.currentTrack}>
            {currentBook && currentChapter > 0 ? (
              <>
                <Text style={styles.bookTitle}>{currentBook}</Text>
                <Text style={styles.chapterTitle}>Chapter {currentChapter}</Text>
              </>
            ) : (
              <Text style={styles.bookTitle}>Select a book and chapter to play</Text>
            )}
          </View>

          <View style={styles.playerWrapper}>
            <MinimalAudioPlayer 
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={() => {
                if (selectedBook && currentChapter < selectedBook.chapters) {
                  handleNextChapter();
                }
              }}
              onPrevious={() => {
                if (currentChapter > 1) {
                  handlePreviousChapter();
                }
              }}
              playbackRate={playbackSpeed}
              onChangeSpeed={handleSpeedChange}
              soundObject={sound}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  } as ViewStyle,
  selectionInputs: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: getResponsiveSize(16),
    marginTop: getResponsiveSize(20),
    width: '100%',
    paddingHorizontal: getResponsiveSize(8),
    position: 'relative',
    marginBottom: getResponsiveSize(20),
    zIndex: 2,
  },
  selectorContainer: {
    position: 'relative',
    zIndex: 2,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100001,
    marginTop: 4,
  },
  selectInput: {
    height: getResponsiveSize(48),
    paddingHorizontal: getResponsiveSize(16),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: getResponsiveSize(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: getResponsiveSize(160),
  },
  selectInputDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
  },
  selectInputText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  selectInputTextDisabled: {
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
    zIndex: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: getResponsiveSize(4),
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: getResponsiveSize(12),
    color: '#666',
    lineHeight: getResponsiveSize(16),
    flexWrap: 'wrap',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(16),
    height: getResponsiveSize(48),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'visible',
    marginHorizontal: getResponsiveSize(8),
    position: 'relative',
    zIndex: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
    paddingVertical: 8,
    outlineWidth: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  bibleNavigation: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  testamentTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
    zIndex: 1,
  },
  testamentTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  activeTabPurple: {
    backgroundColor: '#ff8c00',
  },
  testamentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTestamentText: {
    color: 'white',
    fontWeight: '600',
  },
  bookList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bookItem: {
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: getResponsiveSize(50),
    zIndex: 3,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookItemSelected: {
    backgroundColor: '#fff9f1',
    borderLeftWidth: 3,
    borderLeftColor: '#ff8c00',
  },
  bookText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  audioPlayerSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  currentTrack: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  chapterTitle: {
    fontSize: 14,
    color: '#666',
  },
  playerWrapper: {
    paddingHorizontal: 0,
    marginTop: 8,
  },
  chapterSelector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  chapterGrid: {
    flexDirection: 'column',
    width: '100%',
  },
  chapterButton: {
    width: '100%',
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: getResponsiveSize(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeChapter: {
    backgroundColor: '#fff9f1',
    borderLeftWidth: 3,
    borderLeftColor: '#ff8c00',
  },
  chapterButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ff8c00',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  selectorModal: {
    position: 'relative',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: getResponsiveSize(12),
    maxHeight: getResponsiveSize(400),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  modalBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  modalContent: {
    width: '100%',
    maxHeight: getResponsiveSize(400),
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingVertical: getResponsiveSize(8),
    zIndex: 3,
    position: 'relative',
    borderRadius: getResponsiveSize(12),
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
});

