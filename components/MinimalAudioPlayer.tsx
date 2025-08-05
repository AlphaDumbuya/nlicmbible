import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface MinimalAudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playbackRate?: number;
  onChangeSpeed?: (rate: number) => void;
  soundObject?: any;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const MinimalAudioPlayer: React.FC<MinimalAudioPlayerProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playbackRate = 1.0,
  onChangeSpeed,
  soundObject,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        {onChangeSpeed && (
          <View style={styles.speedContainer}>
            <TouchableOpacity 
              onPress={() => setShowSpeedMenu(true)}
              style={styles.speedButton}
            >
              <Icon name="speedometer-outline" size={24} color="#666" />
              <Text style={styles.speedText}>{playbackRate}x</Text>
            </TouchableOpacity>

            <Modal
              visible={showSpeedMenu}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowSpeedMenu(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowSpeedMenu(false)}
              >
                <View style={styles.speedMenu}>
                  {speedOptions.map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedOption,
                        playbackRate === speed && styles.speedOptionActive
                      ]}
                      onPress={() => {
                        onChangeSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                    >
                      <Text style={[
                        styles.speedOptionText,
                        playbackRate === speed && styles.speedOptionTextActive
                      ]}>
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}
        
        <TouchableOpacity onPress={onPrevious} style={styles.button}>
          <Icon name="play-skip-back" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
          <Icon 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onNext} style={styles.button}>
          <Icon name="play-skip-forward" size={24} color="#666" />
        </TouchableOpacity>

        {onToggleFavorite && (
          <TouchableOpacity onPress={onToggleFavorite} style={styles.favoriteButton}>
            <Icon 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF8C00" : "#666"} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  button: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 8,
  },
  speedContainer: {
    position: 'relative',
  },
  speedButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speedOption: {
    padding: 12,
    borderRadius: 8,
  },
  speedOptionActive: {
    backgroundColor: '#fff9f1',
  },
  speedOptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  speedOptionTextActive: {
    color: '#FF8C00',
    fontWeight: '600',
  },
});

export default MinimalAudioPlayer;
