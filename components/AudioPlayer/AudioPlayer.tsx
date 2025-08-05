import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable, LayoutChangeEvent, GestureResponderEvent, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Icon from '@expo/vector-icons/Ionicons';
import { AudioCache } from '../../services/AudioCache';
import { AudioPlayerProps } from './types';

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  onPlaybackStateChange, 
  currentTrack,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  duration,
  position,
  isLoading,
  isPlaying,
  volume,
  playbackSpeed
}) => {
  const progressWidth = useRef(0);
  const progress = duration > 0 ? position / duration : 0;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isCaching, setIsCaching] = useState(false);

  useEffect(() => {
    // Initialize audio cache
    AudioCache.init();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (currentTrack) {
      loadAudio();
    }
  }, [currentTrack]);

  const loadAudio = async () => {
    if (!currentTrack) return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setIsCaching(true);

      // Try to get the cached audio file first
      let audioUri = await AudioCache.getCachedUri(currentTrack.book, currentTrack.chapter);

      // If not cached, download and cache it
      if (!audioUri) {
        audioUri = await AudioCache.cacheAudio(currentTrack.book, currentTrack.chapter);
      }

      if (!audioUri) {
        console.error('Audio file not found or failed to cache');
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false, progressUpdateIntervalMillis: 1000 },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsCaching(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      onPlaybackStateChange?.(status.isPlaying);
      if (status.didJustFinish) {
        onNext?.();
      }
    }
  };
  const handleSeek = (value: number) => {
    if (onSeek) {
      onSeek(value * duration);
    }
  };
  
  const handlePlayPause = () => {
    if (onPlaybackStateChange) {
      onPlaybackStateChange(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (onVolumeChange) {
      onVolumeChange(value);
    }
  };

  const handleSpeedChange = (value: number) => {
    if (onSpeedChange) {
      onSpeedChange(value);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          <Pressable
            style={styles.progressTouch}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              progressWidth.current = width;
            }}
            onTouchStart={(event) => {
              const { locationX } = event.nativeEvent;
              handleSeek(locationX / progressWidth.current);
            }}
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.leftControls}>
          <TouchableOpacity
            style={[styles.speedButton, { marginRight: 8 }]}
            onPress={() => handleSpeedChange(playbackSpeed === 1.5 ? 0.5 : playbackSpeed === 0.5 ? 1.0 : 1.5)}
          >
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onPrevious} 
            style={styles.button}
            disabled={isLoading || isCaching}
          >
            <Icon name="play-skip-back" size={24} color={(isLoading || isCaching) ? '#ccc' : '#333'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handlePlayPause} 
          style={[styles.playButton, (isLoading || isCaching) && styles.playButtonDisabled]}
          disabled={isLoading || isCaching}
        >
          {isCaching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="#fff"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onNext} 
          style={styles.button}
          disabled={isLoading || isCaching}
        >
          <Icon name="play-skip-forward" size={24} color={(isLoading || isCaching) ? '#ccc' : '#333'} />
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View style={styles.extraControls}>
        <View style={styles.volumeControl}>
          <Icon name="volume-low" size={20} color="#666" />
          <Pressable 
            style={styles.slider}
            onLayout={(event: LayoutChangeEvent) => {
              const { width } = event.nativeEvent.layout;
              progressWidth.current = width;
            }}
            onTouchStart={(event: GestureResponderEvent) => {
              const { locationX } = event.nativeEvent;
              handleVolumeChange(locationX / progressWidth.current);
            }}
          >
            <View style={[styles.sliderFill, { width: `${volume * 100}%` }]} />
          </Pressable>
          <Icon name="volume-high" size={20} color="#666" />
        </View>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Added space for bottom navigation bar
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    width: 50,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    marginHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#FF6B00',
    borderRadius: 4,
  },
  progressTouch: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    bottom: -10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    padding: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  extraControls: {
    marginTop: 16,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  slider: {
    flex: 1,
    height: 4,
    backgroundColor: '#eee',
    marginHorizontal: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    minWidth: 48,
    alignItems: 'center',
  },
  activeSpeed: {
    backgroundColor: '#FF6B00',
  },
  speedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  activeSpeedText: {
    color: '#fff',
  },
});

export default AudioPlayer;
