interface BookCategory {
  id: string;
  name: string;
  description: string;
  books: string[];
  testament: 'old' | 'new';
}

const bookCategories: BookCategory[] = [
  {
    id: 'law',
    name: 'Law (The Torah)',
    description: 'The five books of Moses, establishing God\'s covenant with Israel',
    testament: 'old',
    books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']
  },
  {
    id: 'history',
    name: 'History of Israel',
    description: 'Chronicles of Israel\'s journey, kings, and God\'s faithfulness',
    testament: 'old',
    books: [
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
      '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
      'Ezra', 'Nehemiah', 'Esther'
    ]
  },
  {
    id: 'poetry',
    name: 'Poetry & Wisdom',
    description: 'Songs, proverbs, and wisdom for life and worship',
    testament: 'old',
    books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon']
  },
  {
    id: 'major-prophets',
    name: 'Major Prophets',
    description: 'Long, powerful messages from God to the nations',
    testament: 'old',
    books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel']
  },
  {
    id: 'minor-prophets',
    name: 'Minor Prophets',
    description: 'Short prophetic messages with big impact',
    testament: 'old',
    books: [
      'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
      'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
      'Haggai', 'Zechariah', 'Malachi'
    ]
  },
  {
    id: 'gospels',
    name: 'Gospels',
    description: 'The life, teachings, death, and resurrection of Jesus',
    testament: 'new',
    books: ['Matthew', 'Mark', 'Luke', 'John']
  },
  {
    id: 'church-history',
    name: 'Early Church History',
    description: 'The spread of the gospel and rise of the church',
    testament: 'new',
    books: ['Acts']
  },
  {
    id: 'paul-letters',
    name: 'Paul\'s Letters',
    description: 'Teaching and guidance for churches and individuals',
    testament: 'new',
    books: [
      'Romans', '1 Corinthians', '2 Corinthians',
      'Galatians', 'Ephesians', 'Philippians',
      'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
    ]
  },
  {
    id: 'general-letters',
    name: 'General Letters',
    description: 'Encouragement and truth from various apostles',
    testament: 'new',
    books: [
      'Hebrews', 'James', '1 Peter', '2 Peter',
      '1 John', '2 John', '3 John', 'Jude'
    ]
  },
  {
    id: 'apocalyptic',
    name: 'Prophecy & End Times',
    description: 'Visions of heaven, judgment, and the future',
    testament: 'new',
    books: ['Revelation']
  }
];

const bookCategoriesExport = { bookCategories };
export { bookCategories };
export default bookCategoriesExport;
