// Universal Bible Data Conversion Script
// This script converts ALL Bible versions with speaker detection

import fs from 'fs'
import path from 'path'

// Import the speaker reference data
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const speakerReference = JSON.parse(
  readFileSync(join(__dirname, '../data/speakerReference.json'), 'utf8'),
)
const keyPeopleData = JSON.parse(readFileSync(join(__dirname, '../data/keyPeople.json'), 'utf8'))

// Book metadata mapping for all books
const bookMetadata = {
  // Old Testament
  Genesis: { id: 'genesis', testament: 'old', order: 1, author: 'Moses', date: '1445-1405 BC' },
  Exodus: { id: 'exodus', testament: 'old', order: 2, author: 'Moses', date: '1445-1405 BC' },
  Leviticus: { id: 'leviticus', testament: 'old', order: 3, author: 'Moses', date: '1445-1405 BC' },
  Numbers: { id: 'numbers', testament: 'old', order: 4, author: 'Moses', date: '1445-1405 BC' },
  Deuteronomy: {
    id: 'deuteronomy',
    testament: 'old',
    order: 5,
    author: 'Moses',
    date: '1445-1405 BC',
  },
  Joshua: { id: 'joshua', testament: 'old', order: 6, author: 'Joshua', date: '1405-1385 BC' },
  Judges: { id: 'judges', testament: 'old', order: 7, author: 'Samuel', date: '1050-1000 BC' },
  Ruth: { id: 'ruth', testament: 'old', order: 8, author: 'Samuel', date: '1050-1000 BC' },
  '1 Samuel': { id: '1samuel', testament: 'old', order: 9, author: 'Samuel', date: '1050-1000 BC' },
  '2 Samuel': {
    id: '2samuel',
    testament: 'old',
    order: 10,
    author: 'Samuel',
    date: '1050-1000 BC',
  },
  '1 Kings': { id: '1kings', testament: 'old', order: 11, author: 'Jeremiah', date: '600-550 BC' },
  '2 Kings': { id: '2kings', testament: 'old', order: 12, author: 'Jeremiah', date: '600-550 BC' },
  '1 Chronicles': {
    id: '1chronicles',
    testament: 'old',
    order: 13,
    author: 'Ezra',
    date: '450-400 BC',
  },
  '2 Chronicles': {
    id: '2chronicles',
    testament: 'old',
    order: 14,
    author: 'Ezra',
    date: '450-400 BC',
  },
  Ezra: { id: 'ezra', testament: 'old', order: 15, author: 'Ezra', date: '450-400 BC' },
  Nehemiah: { id: 'nehemiah', testament: 'old', order: 16, author: 'Nehemiah', date: '450-400 BC' },
  Esther: { id: 'esther', testament: 'old', order: 17, author: 'Mordecai', date: '450-400 BC' },
  Job: { id: 'job', testament: 'old', order: 18, author: 'Job', date: '2000-1800 BC' },
  Psalm: { id: 'psalm', testament: 'old', order: 19, author: 'David', date: '1000-400 BC' },
  Proverbs: { id: 'proverbs', testament: 'old', order: 20, author: 'Solomon', date: '950-700 BC' },
  'Song Of Solomon': {
    id: 'songofsolomon',
    testament: 'old',
    order: 21,
    author: 'Solomon',
    date: '950 BC',
  },
  Ecclesiastes: {
    id: 'ecclesiastes',
    testament: 'old',
    order: 22,
    author: 'Solomon',
    date: '935 BC',
  },
  Isaiah: { id: 'isaiah', testament: 'old', order: 23, author: 'Isaiah', date: '740-680 BC' },
  Jeremiah: { id: 'jeremiah', testament: 'old', order: 24, author: 'Jeremiah', date: '627-580 BC' },
  Lamentations: {
    id: 'lamentations',
    testament: 'old',
    order: 25,
    author: 'Jeremiah',
    date: '586 BC',
  },
  Ezekiel: { id: 'ezekiel', testament: 'old', order: 26, author: 'Ezekiel', date: '593-570 BC' },
  Daniel: { id: 'daniel', testament: 'old', order: 27, author: 'Daniel', date: '605-536 BC' },
  Hosea: { id: 'hosea', testament: 'old', order: 28, author: 'Hosea', date: '750-710 BC' },
  Joel: { id: 'joel', testament: 'old', order: 29, author: 'Joel', date: '835-800 BC' },
  Amos: { id: 'amos', testament: 'old', order: 30, author: 'Amos', date: '760-750 BC' },
  Obadiah: { id: 'obadiah', testament: 'old', order: 31, author: 'Obadiah', date: '840 BC' },
  Jonah: { id: 'jonah', testament: 'old', order: 32, author: 'Jonah', date: '760 BC' },
  Micah: { id: 'micah', testament: 'old', order: 33, author: 'Micah', date: '735-700 BC' },
  Nahum: { id: 'nahum', testament: 'old', order: 34, author: 'Nahum', date: '650 BC' },
  Habakkuk: { id: 'habakkuk', testament: 'old', order: 35, author: 'Habakkuk', date: '607 BC' },
  Zephaniah: { id: 'zephaniah', testament: 'old', order: 36, author: 'Zephaniah', date: '630 BC' },
  Haggai: { id: 'haggai', testament: 'old', order: 37, author: 'Haggai', date: '520 BC' },
  Zechariah: {
    id: 'zechariah',
    testament: 'old',
    order: 38,
    author: 'Zechariah',
    date: '520-480 BC',
  },
  Malachi: { id: 'malachi', testament: 'old', order: 39, author: 'Malachi', date: '430 BC' },

  // New Testament
  Matthew: { id: 'matthew', testament: 'new', order: 40, author: 'Matthew', date: '50-70 AD' },
  Mark: { id: 'mark', testament: 'new', order: 41, author: 'Mark', date: '65-70 AD' },
  Luke: { id: 'luke', testament: 'new', order: 42, author: 'Luke', date: '60-85 AD' },
  John: { id: 'john', testament: 'new', order: 43, author: 'John', date: '85-95 AD' },
  Acts: { id: 'acts', testament: 'new', order: 44, author: 'Luke', date: '60-85 AD' },
  Romans: { id: 'romans', testament: 'new', order: 45, author: 'Paul', date: '57 AD' },
  '1 Corinthians': {
    id: '1corinthians',
    testament: 'new',
    order: 46,
    author: 'Paul',
    date: '55 AD',
  },
  '2 Corinthians': {
    id: '2corinthians',
    testament: 'new',
    order: 47,
    author: 'Paul',
    date: '56 AD',
  },
  Galatians: { id: 'galatians', testament: 'new', order: 48, author: 'Paul', date: '49 AD' },
  Ephesians: { id: 'ephesians', testament: 'new', order: 49, author: 'Paul', date: '62 AD' },
  Philippians: { id: 'philippians', testament: 'new', order: 50, author: 'Paul', date: '62 AD' },
  Colossians: { id: 'colossians', testament: 'new', order: 51, author: 'Paul', date: '62 AD' },
  '1 Thessalonians': {
    id: '1thessalonians',
    testament: 'new',
    order: 52,
    author: 'Paul',
    date: '51 AD',
  },
  '2 Thessalonians': {
    id: '2thessalonians',
    testament: 'new',
    order: 53,
    author: 'Paul',
    date: '52 AD',
  },
  '1 Timothy': { id: '1timothy', testament: 'new', order: 54, author: 'Paul', date: '64 AD' },
  '2 Timothy': { id: '2timothy', testament: 'new', order: 55, author: 'Paul', date: '67 AD' },
  Titus: { id: 'titus', testament: 'new', order: 56, author: 'Paul', date: '64 AD' },
  Philemon: { id: 'philemon', testament: 'new', order: 57, author: 'Paul', date: '62 AD' },
  Hebrews: { id: 'hebrews', testament: 'new', order: 58, author: 'Unknown', date: 'Unknown' },
  James: { id: 'james', testament: 'new', order: 59, author: 'James', date: '45-50 AD' },
  '1 Peter': { id: '1peter', testament: 'new', order: 60, author: 'Peter', date: '64 AD' },
  '2 Peter': { id: '2peter', testament: 'new', order: 61, author: 'Peter', date: '67 AD' },
  '1 John': { id: '1john', testament: 'new', order: 62, author: 'John', date: '85-95 AD' },
  '2 John': { id: '2john', testament: 'new', order: 63, author: 'John', date: '85-95 AD' },
  '3 John': { id: '3john', testament: 'new', order: 64, author: 'John', date: '85-95 AD' },
  Jude: { id: 'jude', testament: 'new', order: 65, author: 'Jude', date: '65-80 AD' },
  Revelation: { id: 'revelation', testament: 'new', order: 66, author: 'John', date: '95 AD' },
}

// Book themes and characters (simplified for all books)
const bookThemes = {
  Genesis: ['Creation', 'Fall', 'Covenant', 'Promise'],
  Exodus: ['Deliverance', 'Law', 'Covenant', 'Presence'],
  Leviticus: ['Holiness', 'Sacrifice', 'Priesthood', 'Worship'],
  Numbers: ['Wilderness', 'Testing', 'Faithfulness', 'Promise'],
  Deuteronomy: ['Law', 'Covenant', 'Blessing', 'Obedience'],
  Joshua: ['Conquest', 'Promise', 'Faith', 'Victory'],
  Judges: ['Cycle', 'Deliverance', 'Faithfulness', 'Leadership'],
  Ruth: ['Loyalty', 'Redemption', 'Providence', 'Love'],
  '1 Samuel': ['Kingship', 'Leadership', 'Anointing', 'Transition'],
  '2 Samuel': ['David', 'Covenant', 'Sin', 'Restoration'],
  '1 Kings': ['Kingdom', 'Temple', 'Wisdom', 'Division'],
  '2 Kings': ['Decline', 'Exile', 'Judgment', 'Hope'],
  '1 Chronicles': ['Genealogy', 'Temple', 'Worship', 'David'],
  '2 Chronicles': ['Temple', 'Worship', 'Reform', 'Exile'],
  Ezra: ['Return', 'Temple', 'Restoration', 'Worship'],
  Nehemiah: ['Wall', 'Leadership', 'Reform', 'Community'],
  Esther: ['Providence', 'Courage', 'Deliverance', 'Hidden God'],
  Job: ['Suffering', 'Wisdom', 'Faith', 'Restoration'],
  Psalm: ['Worship', 'Prayer', 'Praise', 'Lament'],
  Proverbs: ['Wisdom', 'Fear of Lord', 'Righteousness', 'Folly'],
  'Song Of Solomon': ['Love', 'Marriage', 'Intimacy', 'Beauty'],
  Ecclesiastes: ['Vanity', 'Wisdom', 'Meaning', 'Fear of God'],
  Isaiah: ['Salvation', 'Messiah', 'Judgment', 'Hope'],
  Jeremiah: ['Judgment', 'New Covenant', 'Repentance', 'Hope'],
  Lamentations: ['Grief', 'Judgment', 'Mercy', 'Hope'],
  Ezekiel: ['Glory', 'Judgment', 'Restoration', 'New Heart'],
  Daniel: ['Sovereignty', 'Kingdom', 'Faithfulness', 'Revelation'],
  Hosea: ['Love', 'Faithfulness', 'Judgment', 'Restoration'],
  Joel: ['Day of Lord', 'Judgment', 'Salvation', 'Spirit'],
  Amos: ['Justice', 'Judgment', 'Righteousness', 'Restoration'],
  Obadiah: ['Judgment', 'Pride', 'Day of Lord', 'Restoration'],
  Jonah: ['Mercy', 'Repentance', 'Mission', 'Salvation'],
  Micah: ['Justice', 'Mercy', 'Messiah', 'Restoration'],
  Nahum: ['Judgment', 'Justice', 'Comfort', 'Deliverance'],
  Habakkuk: ['Faith', 'Justice', 'Salvation', 'Trust'],
  Zephaniah: ['Day of Lord', 'Judgment', 'Salvation', 'Restoration'],
  Haggai: ['Temple', 'Priority', 'Blessing', 'Glory'],
  Zechariah: ['Messiah', 'Salvation', 'Judgment', 'Restoration'],
  Malachi: ['Covenant', 'Tithing', 'Messenger', 'Elijah'],
  Matthew: ['Kingdom of Heaven', 'Jesus as Messiah', 'Discipleship'],
  Mark: ['Jesus as Servant', 'Action', 'Suffering'],
  Luke: ['Jesus as Savior', 'Compassion', 'Prayer'],
  John: ['Jesus as Son of God', 'Eternal Life', 'Love'],
  Acts: ['Holy Spirit', 'Church Growth', 'Mission'],
  Romans: ['Justification by Faith', 'Righteousness', 'Grace'],
  '1 Corinthians': ['Church Unity', 'Spiritual Gifts', 'Love'],
  '2 Corinthians': ['Ministry', 'Suffering', 'Reconciliation'],
  Galatians: ['Freedom in Christ', 'Faith vs Works', 'Grace'],
  Ephesians: ['Unity in Christ', 'Spiritual Warfare', 'Grace'],
  Philippians: ['Joy', 'Humility', 'Contentment'],
  Colossians: ['Supremacy of Christ', 'Fullness', 'Wisdom'],
  '1 Thessalonians': ['Second Coming', 'Holiness', 'Encouragement'],
  '2 Thessalonians': ['Second Coming', 'End Times', 'Perseverance'],
  '1 Timothy': ['Church Leadership', 'Sound Doctrine', 'Godliness'],
  '2 Timothy': ['Faithfulness', 'Endurance', 'Scripture'],
  Titus: ['Good Works', 'Sound Doctrine', 'Leadership'],
  Philemon: ['Forgiveness', 'Brotherly Love', 'Reconciliation'],
  Hebrews: ['Superiority of Christ', 'Faith', 'Perseverance'],
  James: ['Faith and Works', 'Wisdom', 'Patience'],
  '1 Peter': ['Suffering', 'Hope', 'Holiness'],
  '2 Peter': ['False Teachers', 'Knowledge', 'Patience'],
  '1 John': ['Love', 'Fellowship', 'Truth'],
  '2 John': ['Truth', 'Love', 'Deception'],
  '3 John': ['Hospitality', 'Truth', 'Good Works'],
  Jude: ['Contending for Faith', 'False Teachers', 'Mercy'],
  Revelation: ['End Times', 'Victory', 'Worship'],
}

// Function to determine speaker for a verse
function getSpeakerForVerse(bookId, chapter, verse) {
  // Check if Jesus is speaking
  if (
    speakerReference.jesus[bookId] &&
    speakerReference.jesus[bookId][chapter] &&
    speakerReference.jesus[bookId][chapter].includes(verse)
  ) {
    return 'Jesus'
  }

  // Check if God is speaking
  if (
    speakerReference.god[bookId] &&
    speakerReference.god[bookId][chapter] &&
    speakerReference.god[bookId][chapter].includes(verse)
  ) {
    return 'God'
  }

  // Default to narrator/other
  return 'Narrator'
}

// Enhanced verse creation with speaker detection
function createVerseWithSpeaker(verseId, bookId, bookName, chapter, verse, verseText, translation) {
  const speaker = getSpeakerForVerse(bookId, chapter, verse)

  return {
    id: verseId,
    translation: translation,
    book: bookId,
    bookName: bookName,
    chapter: chapter,
    verse: verse,
    text: verseText,
    paragraph: Math.ceil(verse / 5),
    speaker: speaker,
    isRedLetter: speaker === 'Jesus' || speaker === 'God',
  }
}

// Enhanced book conversion with speaker detection
function convertBookWithSpeakers(bookName, bookData, translation) {
  const metadata = bookMetadata[bookName]
  if (!metadata) {
    console.warn(`No metadata found for book: ${bookName}`)
    return null
  }

  const chapters = []
  const verses = []
  let totalVerses = 0
  let jesusVerses = 0
  let godVerses = 0

  // Process each chapter
  Object.keys(bookData).forEach((chapterNum) => {
    const chapterData = bookData[chapterNum]
    const chapterVerses = []

    // Process each verse in the chapter
    Object.keys(chapterData).forEach((verseNum) => {
      const verseText = chapterData[verseNum]
      const verseId = `${translation.toLowerCase()}_${metadata.id}_${chapterNum}_${verseNum}`

      const verse = createVerseWithSpeaker(
        verseId,
        metadata.id,
        bookName,
        parseInt(chapterNum),
        parseInt(verseNum),
        verseText,
        translation,
      )

      chapterVerses.push(verse)
      verses.push(verse)
      totalVerses++

      // Count speaker types
      if (verse.speaker === 'Jesus') jesusVerses++
      if (verse.speaker === 'God') godVerses++
    })

    chapters.push({
      number: parseInt(chapterNum),
      summary: `Chapter ${chapterNum} of ${bookName}`,
      verses: chapterVerses,
    })
  })

  // Create enhanced book structure
  const book = {
    id: metadata.id,
    name: bookName,
    testament: metadata.testament,
    order: metadata.order,
    chapterCount: chapters.length,
    verseCount: totalVerses,
    translation: translation,
    speakerStats: {
      jesusVerses: jesusVerses,
      godVerses: godVerses,
      narratorVerses: totalVerses - jesusVerses - godVerses,
    },
    summary: {
      short: `${bookName} contains ${chapters.length} chapters`,
      long: `${bookName} is a book of the ${metadata.testament === 'new' ? 'New Testament' : 'Old Testament'}.`,
      keyThemes: bookThemes[bookName] || [],
      keyCharacters: keyPeopleData[metadata.id]?.keyPeople || [],
    },
    author: {
      name: metadata.author,
      confidence: 'high',
      notes: '',
    },
    dateWritten: {
      estimated: metadata.date,
      confidence: 'high',
      notes: '',
    },
    chapters: chapters,
  }

  return { book, verses }
}

// Get all available Bible versions
function getAvailableVersions() {
  const dataDir = './src/data'
  const versions = []

  if (fs.existsSync(dataDir)) {
    const items = fs.readdirSync(dataDir)
    items.forEach((item) => {
      const itemPath = path.join(dataDir, item)
      if (fs.statSync(itemPath).isDirectory() && item !== 'converted') {
        const booksDir = path.join(itemPath, `${item}_books`)
        if (fs.existsSync(booksDir)) {
          versions.push({
            name: item,
            path: itemPath,
            booksPath: booksDir,
          })
        }
      }
    })
  }

  return versions
}

// Convert a single Bible version
function convertBibleVersion(version) {
  console.log(`\n🔄 Converting ${version.name}...`)

  const outputDir = `./src/data/converted/${version.name}`

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const convertedBooks = []
  const allVerses = []
  let totalJesusVerses = 0
  let totalGodVerses = 0

  // Get list of JSON files in the version's books directory
  const files = fs.readdirSync(version.booksPath).filter((file) => file.endsWith('.json'))

  files.forEach((file) => {
    const filePath = path.join(version.booksPath, file)
    const bookName = path.basename(file, '.json')

    try {
      const rawData = fs.readFileSync(filePath, 'utf8')
      const jsonData = JSON.parse(rawData)

      // Extract book data (skip the Info section)
      const bookData = jsonData[bookName]
      if (!bookData) {
        console.warn(`No data found for book: ${bookName}`)
        return
      }

      const converted = convertBookWithSpeakers(bookName, bookData, version.name)
      if (converted) {
        convertedBooks.push(converted.book)
        allVerses.push(...converted.verses)

        totalJesusVerses += converted.book.speakerStats.jesusVerses
        totalGodVerses += converted.book.speakerStats.godVerses

        // Save individual book files
        const bookFileName = `${converted.book.id}Book.json`
        const versesFileName = `${converted.book.id}Verses.json`

        fs.writeFileSync(
          path.join(outputDir, bookFileName),
          JSON.stringify(converted.book, null, 2),
        )
        fs.writeFileSync(
          path.join(outputDir, versesFileName),
          JSON.stringify(converted.verses, null, 2),
        )

        console.log(
          `  ✓ ${bookName} (${converted.book.chapterCount} chapters, ${converted.book.verseCount} verses) - Jesus: ${converted.book.speakerStats.jesusVerses}, God: ${converted.book.speakerStats.godVerses}`,
        )
      }
    } catch (error) {
      console.error(`  ❌ Error converting ${bookName}:`, error.message)
    }
  })

  // Save combined data for this version
  fs.writeFileSync(path.join(outputDir, 'allBooks.json'), JSON.stringify(convertedBooks, null, 2))
  fs.writeFileSync(path.join(outputDir, 'allVerses.json'), JSON.stringify(allVerses, null, 2))

  console.log(`  🎉 ${version.name} conversion complete!`)
  console.log(`  📚 Converted ${convertedBooks.length} books`)
  console.log(`  📝 Total verses: ${allVerses.length}`)
  console.log(`  🔴 Jesus speaking verses: ${totalJesusVerses}`)
  console.log(`  ⚡ God speaking verses: ${totalGodVerses}`)

  return {
    version: version.name,
    books: convertedBooks.length,
    verses: allVerses.length,
    jesusVerses: totalJesusVerses,
    godVerses: totalGodVerses,
  }
}

// Main conversion function
function convertAllBibleVersions() {
  console.log('🚀 Starting conversion of all Bible versions...')

  const versions = getAvailableVersions()

  if (versions.length === 0) {
    console.log('❌ No Bible versions found in src/data/')
    return
  }

  console.log(
    `📖 Found ${versions.length} Bible versions: ${versions.map((v) => v.name).join(', ')}`,
  )

  const results = []
  const startTime = Date.now()

  versions.forEach((version) => {
    try {
      const result = convertBibleVersion(version)
      results.push(result)
    } catch (error) {
      console.error(`❌ Failed to convert ${version.name}:`, error.message)
    }
  })

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  // Summary
  console.log(`\n🎉 All conversions complete! (${duration}s)`)
  console.log(`📊 Summary:`)

  let totalBooks = 0
  let totalVerses = 0
  let totalJesusVerses = 0
  let totalGodVerses = 0

  results.forEach((result) => {
    console.log(`  ${result.version}: ${result.books} books, ${result.verses} verses`)
    totalBooks += result.books
    totalVerses += result.verses
    totalJesusVerses += result.jesusVerses
    totalGodVerses += result.godVerses
  })

  console.log(`\n📈 Grand Total:`)
  console.log(`  📚 Total books: ${totalBooks}`)
  console.log(`  📝 Total verses: ${totalVerses}`)
  console.log(`  🔴 Jesus speaking verses: ${totalJesusVerses}`)
  console.log(`  ⚡ God speaking verses: ${totalGodVerses}`)
  console.log(`\n📁 All converted data saved to: src/data/converted/`)
}

// Run the conversion
convertAllBibleVersions()
