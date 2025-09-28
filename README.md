# Christ Companions - Interactive Bible Study Application

A modern, feature-rich Bible study application built with Vue 3, designed to provide an immersive and interactive experience for reading, studying, and taking notes on the Bible.

## 🌟 Features

### 📖 **Multi-Version Bible Reading**

- **30+ Bible Versions**: KJV, NIV, ESV, NASB, NLT, and many more
- **Verse Comparison**: Compare verses across different translations
- **Smart Navigation**: Easy chapter and verse selection with visual indicators

### 🎧 **Text-to-Speech**

- **Audio Reading**: Listen to entire chapters or specific verses
- **Voice Selection**: Choose from available system voices
- **Speed Control**: Adjustable reading speed (0.5x to 2x)
- **Auto-Advance**: Seamlessly continues to next chapter when reading

### 📝 **Comprehensive Note-Taking**

- **Multi-Level Notes**: Verse, Chapter, and Book-level annotations
- **Visual Highlighting**: Notes automatically highlight when corresponding verse is active
- **Rich Text Support**: Full text editing with word wrapping
- **Persistent Storage**: All notes saved locally in browser

### ❓ **Study Questions**

- **Question Management**: Create and organize study questions
- **Level-Based Organization**: Questions for verses, chapters, or entire books
- **Quick Access**: Click questions to navigate to relevant verses

### 👥 **Key People & Character Study**

- **Character Database**: Comprehensive list of biblical figures
- **Verse Highlighting**: Find all verses mentioning specific people
- **Chapter Organization**: Verses grouped by chapter for easy study
- **Smart Navigation**: Click verses to jump directly to them

### 🎨 **Modern User Interface**

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Layout**: Intuitive navigation with collapsible sections
- **Visual Feedback**: Clear indicators for active verses, chapters, and books
- **Smooth Animations**: Polished transitions and interactions

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Finsternavy/ChristCompanions.git
   cd ChristCompanions
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/          # Vue components
│   ├── TheNav.vue      # Top navigation bar
│   ├── SideNav.vue     # Left sidebar with books & key people
│   └── ChapterViewer.vue # Chapter display component
├── views/
│   ├── Bible.vue       # Main Bible reading interface
│   └── TheHome.vue      # Home page
├── stores/
│   └── bibleStore.js   # Pinia store for Bible data & state
├── data/               # Bible data files
│   ├── bibleVersions.json
│   ├── bookSummaries.json
│   ├── keyPeople.json
│   └── [version folders]/ # Individual Bible version data
└── models/             # Data structure definitions
```

## 📚 Data Sources

The application includes comprehensive biblical data:

- **Bible Versions**: 30+ translations with full text
- **Book Summaries**: Detailed summaries for each book
- **Key People**: Extensive database of biblical characters
- **Speaker References**: Identification of who is speaking in verses
- **Book Structure**: Complete chapter and verse organization

## 🎯 Key Features Explained

### Smart Book Selection

- **Auto-Expanding Testaments**: The relevant testament (Old/New) automatically expands when a book is selected
- **Visual Indicators**: Active book highlighted in its natural location
- **Search Functionality**: Quick search through all books

### Interactive Note System

- **Context-Aware**: Notes automatically link to specific verses
- **Visual Connection**: Note cards highlight when their corresponding verse is active
- **Multi-Level Organization**: Notes can be verse-specific, chapter-wide, or book-level

### Character Study Tools

- **People Database**: Comprehensive list of biblical figures with verse references
- **Smart Filtering**: Only shows people relevant to the current book
- **Verse Navigation**: Click any verse reference to jump directly to it
- **Chapter Organization**: Verses grouped by chapter for systematic study

### Audio Features

- **Flexible Reading**: Start from any verse or read entire chapters
- **Voice Customization**: Choose from available system voices
- **Speed Control**: Adjust reading speed to your preference
- **Seamless Continuation**: Automatically moves to next chapter when reading

## 🛠️ Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Disable Vetur extension for Vue 3 support

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Technology Stack

- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Pinia** for state management
- **Tailwind CSS** for styling
- **Vue Router** for navigation
- **Heroicons** for UI icons

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Bible data sourced from various public domain and open source Bible projects
- Built with modern web technologies for optimal performance
- Designed for accessibility and ease of use

---

**Christ Companions** - Bringing the Bible to life through modern technology.
