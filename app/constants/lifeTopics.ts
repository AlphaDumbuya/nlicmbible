export interface LifeTopicReference {
  book: string;
  chapter: number;
  verses?: string;
  context: string;
}

export interface LifeTopic {
  topic: string;
  category: string;
  references: LifeTopicReference[];
}

const lifeTopics: LifeTopic[] = [
  {
    topic: 'Overcoming Fear',
    category: 'Emotional Healing',
    references: [
      { book: 'Psalms', chapter: 34, verses: '4-7', context: 'Deliverance from fear' },
      { book: 'Isaiah', chapter: 41, verses: '10-13', context: 'God strengthens against fear' },
      { book: 'Matthew', chapter: 6, verses: '25-34', context: 'Freedom from anxiety' }
    ]
  },
  {
    topic: 'Finding Hope',
    category: 'Encouragement',
    references: [
      { book: 'Romans', chapter: 15, verses: '13', context: 'God of hope' },
      { book: 'Jeremiah', chapter: 29, verses: '11', context: 'Plans for hope and future' },
      { book: 'Psalms', chapter: 42, verses: '5', context: 'Hope in God' }
    ]
  },
  {
    topic: 'Love and Relationships',
    category: 'Relationships',
    references: [
      { book: '1 Corinthians', chapter: 13, verses: '4-7', context: 'Definition of love' },
      { book: 'Song of Solomon', chapter: 8, verses: '6-7', context: 'Power of love' },
      { book: 'Ephesians', chapter: 5, verses: '25-33', context: 'Marriage love' }
    ]
  },
  {
    topic: 'Finding Purpose',
    category: 'Life Direction',
    references: [
      { book: 'Jeremiah', chapter: 1, verses: '5', context: 'Divine purpose before birth' },
      { book: 'Ephesians', chapter: 2, verses: '10', context: 'Created for good works' },
      { book: 'Philippians', chapter: 3, verses: '12-14', context: 'Pursuing life purpose' }
    ]
  },
  {
    topic: 'Dealing with Depression',
    category: 'Mental Health',
    references: [
      { book: 'Psalms', chapter: 42, verses: '5-6', context: 'Hope in despair' },
      { book: 'Isaiah', chapter: 41, verses: '10', context: 'Divine strength' },
      { book: 'Philippians', chapter: 4, verses: '6-7', context: 'Peace over anxiety' }
    ]
  },
  {
    topic: 'Building Faith',
    category: 'Spiritual Growth',
    references: [
      { book: 'Hebrews', chapter: 11, verses: '1-6', context: 'Nature of faith' },
      { book: 'Romans', chapter: 10, verses: '17', context: 'Growing in faith' },
      { book: 'James', chapter: 2, verses: '14-26', context: 'Faith and works' }
    ]
  },
  {
    topic: 'Finding Peace',
    category: 'Inner Peace',
    references: [
      { book: 'John', chapter: 14, verses: '27', context: 'Peace from Jesus' },
      { book: 'Philippians', chapter: 4, verses: '6-7', context: 'Peace through prayer' },
      { book: 'Isaiah', chapter: 26, verses: '3', context: 'Perfect peace' }
    ]
  },
  {
    topic: 'Wisdom for Life',
    category: 'Wisdom',
    references: [
      { book: 'Proverbs', chapter: 3, verses: '5-6', context: 'Trust in Gods wisdom' },
      { book: 'James', chapter: 1, verses: '5-8', context: 'Asking for wisdom' },
      { book: 'Ecclesiastes', chapter: 7, verses: '12', context: 'Value of wisdom' }
    ]
  }
];

export { lifeTopics };
export default { lifeTopics };