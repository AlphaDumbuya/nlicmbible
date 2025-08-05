import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import AudioPlayer from '../components/AudioPlayer/AudioPlayer';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NLICM Krio Bible</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Library')}
      >
        <Icon name="search-outline" size={20} color="#666" />
        <Text style={styles.searchText}>Search for book or chapter</Text>
      </TouchableOpacity>

      {/* Testament Buttons */}
      <View style={styles.testamentContainer}>
        <TouchableOpacity 
          style={styles.testamentButton}
          onPress={() => navigation.navigate('Library', { testament: 'old' })}
        >
          <Text style={styles.testamentText}>Old Testament</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.testamentButton}
          onPress={() => navigation.navigate('Library', { testament: 'new' })}
        >
          <Text style={styles.testamentText}>New Testament</Text>
        </TouchableOpacity>
      </View>

      {/* Book Selectors */}
      <View style={styles.selectors}>
        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorLabel}>Select Book</Text>
          <Icon name="chevron-down-outline" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorLabel}>Select Chapter</Text>
          <Icon name="chevron-down-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Audio Player */}
      <AudioPlayer
        onPlaybackStateChange={(isPlaying) => {
          // Handle playback state changes
          console.log('Playback state:', isPlaying);
        }}
        currentTrack={{
          book: 'Genesis',
          chapter: 1
        }}
        duration={duration}
        position={position}
      />

      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Library')}
        >
          <Icon name="book-outline" size={24} color="#666" />
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Icon name="heart-outline" size={24} color="#666" />
          <Text style={styles.navText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings-outline" size={24} color="#666" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchText: {
    marginLeft: 8,
    color: '#666',
  },
  testamentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  testamentButton: {
    backgroundColor: '#6B46C1',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  testamentText: {
    color: 'white',
    fontWeight: '600',
  },
  selectors: {
    padding: 16,
    gap: 12,
  },
  selector: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectorLabel: {
    color: '#666',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default HomeScreen;
