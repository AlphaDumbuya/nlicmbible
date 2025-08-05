import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Modal,
  Pressable
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { bookCategories } from '../constants/bookCategories';
import { getAudioAsset } from '../../src/constants/audioAssets';
import { oldTestament, newTestament, Book } from '../constants/bible';

const oldTestamentTopics = [
  {
    category: 'Emotional Healing',
    topics: [
      { topic: 'Fear & Anxiety', books: ['Psalms', 'Isaiah'] },
      { topic: 'Depression', books: ['Psalms', 'Job', 'Lamentations'] },
      { topic: 'Loneliness', books: ['Psalms', 'Isaiah'] },
      { topic: 'Grief & Loss', books: ['Psalms', 'Lamentations'] },
      { topic: 'Stress', books: ['Psalms', 'Proverbs'] },
      { topic: 'Anger', books: ['Proverbs', 'Psalms'] }
    ]
  },
  {
    category: 'Relationships',
    topics: [
      { topic: 'Marriage', books: ['Proverbs', 'Song of Solomon'] },
      { topic: 'Parenting', books: ['Proverbs', 'Deuteronomy'] },
      { topic: 'Friendship', books: ['Proverbs', 'Ecclesiastes'] },
      { topic: 'Family', books: ['Genesis', 'Ruth'] },
      { topic: 'Leadership', books: ['Proverbs', 'Nehemiah'] }
    ]
  },
  {
    category: 'Spiritual Growth',
    topics: [
      { topic: 'Wisdom', books: ['Proverbs', 'Ecclesiastes'] },
      { topic: 'Faith', books: ['Genesis', 'Psalms'] },
      { topic: 'Prayer', books: ['Psalms', 'Daniel'] },
      { topic: 'Worship', books: ['Psalms', 'Isaiah'] },
      { topic: 'God\'s Promises', books: ['Genesis', 'Isaiah'] }
    ]
  },
  {
    category: 'Life Challenges',
    topics: [
      { topic: 'Persecution', books: ['Daniel', 'Psalms'] },
      { topic: 'Financial Struggles', books: ['Proverbs', 'Malachi'] },
      { topic: 'Decision Making', books: ['Proverbs', 'Psalms'] },
      { topic: 'Purpose & Calling', books: ['Isaiah', 'Jeremiah'] }
    ]
  },
  {
    category: 'Personal Growth',
    topics: [
      { topic: 'Character Building', books: ['Proverbs', 'Ecclesiastes'] },
      { topic: 'Integrity', books: ['Psalms', 'Daniel'] },
      { topic: 'Self-Control', books: ['Proverbs', 'Job'] },
      { topic: 'Patience', books: ['Job', 'Psalms'] },
      { topic: 'Humility', books: ['Proverbs', 'Isaiah'] }
    ]
  },
  {
    category: 'Work & Success',
    topics: [
      { topic: 'Diligence', books: ['Proverbs', 'Ecclesiastes'] },
      { topic: 'Business Ethics', books: ['Proverbs', 'Leviticus'] },
      { topic: 'Wealth Management', books: ['Proverbs', 'Ecclesiastes'] },
      { topic: 'Leadership Skills', books: ['Nehemiah', 'Proverbs'] }
    ]
  },
  {
    category: 'Justice & Society',
    topics: [
      { topic: 'Social Justice', books: ['Isaiah', 'Amos'] },
      { topic: 'Helping the Poor', books: ['Proverbs', 'Isaiah'] },
      { topic: 'Community Building', books: ['Nehemiah', 'Ruth'] },
      { topic: 'Ethical Living', books: ['Micah', 'Proverbs'] }
    ]
  },
  {
    category: 'Hope & Comfort',
    topics: [
      { topic: 'Finding Peace', books: ['Psalms', 'Isaiah'] },
      { topic: 'God\'s Protection', books: ['Psalms', 'Daniel'] },
      { topic: 'Overcoming Trials', books: ['Job', 'Psalms'] },
      { topic: 'Divine Healing', books: ['Psalms', 'Isaiah'] }
    ]
  }
];

const newTestamentTopics = [
  {
    category: 'Emotional Healing',
    topics: [
      { topic: 'Fear & Anxiety', books: ['Matthew', 'Philippians'] },
      { topic: 'Depression', books: ['2 Corinthians', 'Philippians'] },
      { topic: 'Loneliness', books: ['John', 'Hebrews'] },
      { topic: 'Grief & Loss', books: ['John', '1 Thessalonians'] },
      { topic: 'Stress', books: ['Matthew', 'Philippians', '1 Peter'] },
      { topic: 'Anger', books: ['James', 'Ephesians'] }
    ]
  },
  {
    category: 'Relationships',
    topics: [
      { topic: 'Marriage', books: ['Ephesians', '1 Corinthians'] },
      { topic: 'Parenting', books: ['Ephesians', 'Colossians'] },
      { topic: 'Church Community', books: ['Acts', '1 Corinthians'] },
      { topic: 'Forgiveness', books: ['Matthew', 'Colossians'] },
      { topic: 'Love', books: ['1 Corinthians', '1 John'] }
    ]
  },
  {
    category: 'Spiritual Growth',
    topics: [
      { topic: 'Faith', books: ['Hebrews', 'Romans'] },
      { topic: 'Prayer', books: ['Matthew', 'James'] },
      { topic: 'Holy Spirit', books: ['Acts', 'John'] },
      { topic: 'Discipleship', books: ['Matthew', '2 Timothy'] },
      { topic: 'Grace', books: ['Romans', 'Ephesians'] }
    ]
  },
  {
    category: 'Life Challenges',
    topics: [
      { topic: 'Persecution', books: ['Acts', '1 Peter'] },
      { topic: 'Financial Stewardship', books: ['Matthew', '2 Corinthians'] },
      { topic: 'Decision Making', books: ['James', 'Romans'] },
      { topic: 'Purpose & Calling', books: ['Ephesians', 'Philippians'] },
      { topic: 'Temptation', books: ['1 Corinthians', 'James'] }
    ]
  },
  {
    category: 'Christian Living',
    topics: [
      { topic: 'Fruit of the Spirit', books: ['Galatians', 'Ephesians'] },
      { topic: 'Spiritual Warfare', books: ['Ephesians', 'James'] },
      { topic: 'Identity in Christ', books: ['Romans', 'Ephesians'] },
      { topic: 'Living in Victory', books: ['Romans', '1 John'] },
      { topic: 'Walking in Love', books: ['1 Corinthians', '1 John'] }
    ]
  },
  {
    category: 'Ministry & Service',
    topics: [
      { topic: 'Evangelism', books: ['Acts', 'Matthew'] },
      { topic: 'Spiritual Gifts', books: ['1 Corinthians', 'Romans'] },
      { topic: 'Leadership', books: ['1 Timothy', 'Titus'] },
      { topic: 'Teaching', books: ['James', '2 Timothy'] }
    ]
  },
  {
    category: 'Faith & Doctrine',
    topics: [
      { topic: 'Salvation', books: ['Romans', 'Ephesians'] },
      { topic: 'Resurrection', books: ['1 Corinthians', 'Romans'] },
      { topic: 'End Times', books: ['Revelation', '1 Thessalonians'] },
      { topic: 'Kingdom of God', books: ['Matthew', 'Acts'] }
    ]
  },
  {
    category: 'Hope & Encouragement',
    topics: [
      { topic: 'God\'s Love', books: ['Romans', '1 John'] },
      { topic: 'Future Hope', books: ['Revelation', '1 Thessalonians'] },
      { topic: 'Peace of God', books: ['Philippians', 'John'] },
      { topic: 'Divine Healing', books: ['James', 'Acts'] }
    ]
  }
];

export default function Library() {
  const router = useRouter();
  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new'>('new');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentBooks, setCurrentBooks] = useState<typeof newTestament>(newTestament);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter categories based on selected testament
  const filteredCategories = bookCategories.filter(
    category => category.testament === selectedTestament
  );

  const handleSelectBook = (book: string | Book) => {
    const bookName = typeof book === 'string' ? book : book.name;
    router.push({ 
      pathname: '/home',
      params: { playBook: bookName, playChapter: 1 }
    });
  };

  const renderTopicsSection = () => {
    const currentTopicsData = selectedTestament === 'new' ? newTestamentTopics : oldTestamentTopics;
    
    if (expandedCategory) {
      const categoryData = currentTopicsData.find(c => c.category === expandedCategory);
      
      return (
        <>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setExpandedCategory(null)}
          >
            <Icon name="chevron-back" size={24} color="#FF8C00" />
            <Text style={styles.backButtonText}>Back to Topics</Text>
          </TouchableOpacity>
          <ScrollView>
            <View style={styles.expandedTopics}>
              <Text style={styles.expandedTitle}>{expandedCategory}</Text>
              {categoryData?.topics.map(topic => (
                <View key={topic.topic} style={styles.topicContainer}>
                  <Text style={styles.topicTitle}>{topic.topic}</Text>
                  {topic.books.map((book, index) => (
                    <TouchableOpacity
                      key={`${book}-${index}`}
                      style={styles.referenceItem}
                      onPress={() => handleSelectBook(book)}
                    >
                      <View>
                        <Text style={styles.referenceTitle}>{book}</Text>
                      </View>
                      <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      );
    }

    return (
      <>
        <Text style={styles.sectionSubtitle}>
          Find Biblical guidance for every aspect of life:
        </Text>
        <View style={styles.topicsScroll}>
          {currentTopicsData.map(category => (
            <TouchableOpacity 
              key={category.category}
              style={styles.categoryCard}
              onPress={() => setExpandedCategory(category.category)}
            >
              <Text style={styles.categoryTitle}>{category.category}</Text>
              <Text style={styles.categorySubtext}>{category.topics.length} topics</Text>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  useEffect(() => {
    if (selectedTestament === 'new') {
      setCurrentBooks(newTestament);
    } else {
      setCurrentBooks(oldTestament);
    }
  }, [selectedTestament]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.testamentSelector}>
          <TouchableOpacity
            style={[
              styles.testamentButton,
              selectedTestament === 'new' && styles.selectedTestament,
            ]}
            onPress={() => setSelectedTestament('new')}
          >
            <Text
              style={[
                styles.testamentText,
                selectedTestament === 'new' && styles.selectedTestamentText,
              ]}
            >
              New Testament
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.testamentButton,
              selectedTestament === 'old' && styles.selectedTestament,
            ]}
            onPress={() => setSelectedTestament('old')}
          >
            <Text
              style={[
                styles.testamentText,
                selectedTestament === 'old' && styles.selectedTestamentText,
              ]}
            >
              Old Testament
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Books by Category</Text>
          <View style={styles.categoryGrid}>
            {selectedTestament === 'new' ? 
              ['Gospels', "Paul's Letters", 'General Letters', 'History', 'Prophecy'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.categoryName}>{category}</Text>
                  {category === 'Gospels' && <Text style={styles.bookCount}>4 books</Text>}
                  {category === "Paul's Letters" && <Text style={styles.bookCount}>13 books</Text>}
                  {category === 'General Letters' && <Text style={styles.bookCount}>8 books</Text>}
                  {category === 'History' && <Text style={styles.bookCount}>1 book</Text>}
                  {category === 'Prophecy' && <Text style={styles.bookCount}>1 book</Text>}
                </TouchableOpacity>
              ))
              :
              ['Law (The Torah)', 'History of Israel', 'Poetry & Wisdom', 'Major Prophets', 'Minor Prophets'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.categoryName}>{category}</Text>
                  {category === 'Law (The Torah)' && <Text style={styles.bookCount}>5 books</Text>}
                  {category === 'History of Israel' && <Text style={styles.bookCount}>12 books</Text>}
                  {category === 'Poetry & Wisdom' && <Text style={styles.bookCount}>5 books</Text>}
                  {category === 'Major Prophets' && <Text style={styles.bookCount}>5 books</Text>}
                  {category === 'Minor Prophets' && <Text style={styles.bookCount}>12 books</Text>}
                </TouchableOpacity>
              ))}
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable 
              style={styles.modalOverlay}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalView}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedCategory}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                  {selectedTestament === 'new' && selectedCategory === 'Gospels' && (
                    ['Matthew', 'Mark', 'Luke', 'John'].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedTestament === 'new' && selectedCategory === "Paul's Letters" && (
                    [
                      'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
                      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
                      '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedTestament === 'new' && selectedCategory === 'General Letters' && (
                    [
                      'Hebrews', 'James', '1 Peter', '2 Peter',
                      '1 John', '2 John', '3 John', 'Jude'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedTestament === 'new' && selectedCategory === 'History' && (
                    ['Acts'].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedTestament === 'new' && selectedCategory === 'Prophecy' && (
                    ['Revelation'].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedCategory === 'Law (The Torah)' && (
                    [
                      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedCategory === 'History of Israel' && (
                    [
                      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
                      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
                      'Ezra', 'Nehemiah', 'Esther'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedCategory === 'Poetry & Wisdom' && (
                    [
                      'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedCategory === 'Major Prophets' && (
                    [
                      'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                  {selectedCategory === 'Minor Prophets' && (
                    [
                      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
                      'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
                    ].map(book => (
                      <TouchableOpacity
                        key={book}
                        style={styles.modalItem}
                        onPress={() => {
                          handleSelectBook(book);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{book}</Text>
                        <Icon name="play-circle-outline" size={24} color="#FF8C00" />
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        </View>

        <View style={styles.lifeTopicsSection}>
          <Text style={styles.sectionTitle}>Life Topics</Text>
          {renderTopicsSection()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  testamentSelector: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  testamentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  selectedTestament: {
    backgroundColor: '#FF8C00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testamentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  selectedTestamentText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
    marginLeft: 4,
  },
  categoryItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'space-between',
    height: 90,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  lifeTopicsSection: {
    padding: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  topicsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  categoryCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    flexDirection: 'column',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  categorySubtext: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF8C00',
    marginLeft: 5,
  },
  expandedTopics: {
    padding: 10,
  },
  expandedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  topicContainer: {
    marginBottom: 20,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  referenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  referenceTitle: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flexGrow: 0,
    paddingBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
});
