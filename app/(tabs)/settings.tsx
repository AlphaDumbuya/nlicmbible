import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch,
  Modal,
  ScrollView,
  Linking,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCacheManager } from '../../hooks/useCacheManager';
import OfflineAudioModal from '../../components/OfflineAudioModal';

export default function SettingsScreen() {
  const [autoNextChapter, setAutoNextChapter] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState('high');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    cacheStatus,
    isLoading,
    updateCacheStatus,
    preloadBook,
    removeBookFromCache,
    clearAllCache,
    formatSize
  } = useCacheManager();

  useEffect(() => {
    loadSettings();
    updateCacheStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem('autoNextChapter');
      if (savedSetting !== null) {
        setAutoNextChapter(savedSetting === 'true');
      }
      
      const savedQuality = await AsyncStorage.getItem('downloadQuality');
      if (savedQuality) setDownloadQuality(savedQuality);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleAutoPlay = async () => {
    try {
      const newValue = !autoNextChapter;
      await AsyncStorage.setItem('autoNextChapter', newValue.toString());
      setAutoNextChapter(newValue);
    } catch (error) {
      console.error('Error saving auto-play setting:', error);
    }
  };

  const saveDownloadQuality = async (quality: string) => {
    try {
      await AsyncStorage.setItem('downloadQuality', quality);
      setDownloadQuality(quality);
    } catch (error) {
      console.error('Error saving download quality:', error);
    }
  };

  const handleFeedback = async () => {
    const email = 'alphadumbuya7@gmail.com';
    const subject = 'NLICM Krio Bible App Feedback';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        // If no email app is available, show the email address to copy
        Alert.alert(
          'No Email App Found',
          `Please send your feedback to:\n${email}`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert(
        'Error',
        'Could not open email app. Please send your feedback to alphadumbuya7@gmail.com',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Auto-play Audio</Text>
              <Text style={styles.settingDescription}>
                Automatically play next chapter
              </Text>
            </View>
            <Switch
              value={autoNextChapter}
              onValueChange={toggleAutoPlay}
              trackColor={{ false: '#767577', true: '#FFB366' }}
              thumbColor={autoNextChapter ? '#FF8C00' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { marginTop: 16 }]}>
            <View>
              <Text style={styles.settingTitle}>Download Quality</Text>
              <Text style={styles.settingDescription}>
                Audio quality for offline listening
              </Text>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.qualityButton, downloadQuality === 'high' && styles.selectedButton]}
                onPress={() => saveDownloadQuality('high')}
              >
                <Text style={[styles.buttonText, downloadQuality === 'high' && styles.selectedText]}>High</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.qualityButton, downloadQuality === 'standard' && styles.selectedButton]}
                onPress={() => saveDownloadQuality('standard')}
              >
                <Text style={[styles.buttonText, downloadQuality === 'standard' && styles.selectedText]}>Standard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowAboutModal(true)}
          >
            <View>
              <Text style={styles.settingTitle}>About</Text>
              <Text style={styles.settingDescription}>
                Learn more about the app
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleFeedback}
          >
            <View>
              <Text style={styles.settingTitle}>Send Feedback</Text>
              <Text style={styles.settingDescription}>
                Help us improve the app
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowAudioModal(true)}
          >
            <View>
              <Text style={styles.settingTitle}>Offline Audio</Text>
              <Text style={styles.settingDescription}>
                Manage downloaded audio files ({formatSize(cacheStatus.totalSize)})
              </Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showAudioModal}
        onRequestClose={() => setShowAudioModal(false)}
      >
        <OfflineAudioModal
          onClose={() => setShowAudioModal(false)}
          cacheStatus={cacheStatus}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await updateCacheStatus();
            setRefreshing(false);
          }}
          preloadBook={preloadBook}
          removeBookFromCache={removeBookFromCache}
          clearAllCache={clearAllCache}
          formatSize={formatSize}
        />
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAboutModal}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About NLICM Bible App</Text>
            <Text style={styles.modalText}>
              Version 1.0.0{'\n\n'}
              This app is developed by New Life in Christ Ministry Kossoh Town Chapter to help spread the Word of God in the Krio language.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  qualityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    minWidth: 80,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedButton: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    maxWidth: 250,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});