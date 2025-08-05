import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

const LibraryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Library'>>();
  const [selectedTestament, setSelectedTestament] = useState(
    route.params?.testament || 'old'
  );

  const books = {
    old: [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      // Add more Old Testament books
    ],
    new: [
      'Matthew', 'Mark', 'Luke', 'John', 'Acts',
      // Add more New Testament books
    ]
  };

  const renderBook = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.bookItem}>
      <Text style={styles.bookTitle}>{item}</Text>
      <Icon name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bible Library</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Testament Selector */}
      <View style={styles.testamentSelector}>
        <TouchableOpacity 
          style={[
            styles.testamentButton,
            selectedTestament === 'old' && styles.selectedTestament
          ]}
          onPress={() => setSelectedTestament('old')}
        >
          <Text style={[
            styles.testamentText,
            selectedTestament === 'old' && styles.selectedTestamentText
          ]}>Old Testament</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.testamentButton,
            selectedTestament === 'new' && styles.selectedTestament
          ]}
          onPress={() => setSelectedTestament('new')}
        >
          <Text style={[
            styles.testamentText,
            selectedTestament === 'new' && styles.selectedTestamentText
          ]}>New Testament</Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <FlatList
        data={books[selectedTestament]}
        renderItem={renderBook}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.booksList}
      />
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
  testamentSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  testamentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedTestament: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  testamentText: {
    color: '#666',
    fontWeight: '600',
  },
  selectedTestamentText: {
    color: 'white',
  },
  booksList: {
    padding: 16,
  },
  bookItem: {
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
    fontSize: 16,
    color: '#333',
  },
});

export default LibraryScreen;
