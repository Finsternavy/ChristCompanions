// KJV Data Conversion Script
// This script converts KJV_books data to match your current structure

import fs from 'fs'
import path from 'path'

// Book metadata mapping
const bookMetadata = {
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

// Book themes and characters
const bookThemes = {
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

const bookCharacters = {
  Matthew: ['Jesus', 'Mary', 'Joseph', 'John the Baptist'],
  Mark: ['Jesus', 'Peter', 'John', 'James'],
  Luke: ['Jesus', 'Mary', 'Elizabeth', 'Zechariah'],
  John: ['Jesus', 'John the Baptist', 'Mary', 'Lazarus'],
  Acts: ['Paul', 'Peter', 'Barnabas', 'Stephen'],
  Romans: ['Paul', 'Phoebe', 'Priscilla', 'Aquila'],
  '1 Corinthians': ['Paul', 'Apollos', 'Cephas', 'Stephanas'],
  '2 Corinthians': ['Paul', 'Titus', 'Timothy', 'Stephanas'],
  Galatians: ['Paul', 'Peter', 'Barnabas', 'Titus'],
  Ephesians: ['Paul', 'Tychicus', 'Epaphras', 'Onesimus'],
  Philippians: ['Paul', 'Timothy', 'Epaphroditus', 'Euodia'],
  Colossians: ['Paul', 'Tychicus', 'Onesimus', 'Epaphras'],
  '1 Thessalonians': ['Paul', 'Silas', 'Timothy', 'Jason'],
  '2 Thessalonians': ['Paul', 'Silas', 'Timothy', 'Jason'],
  '1 Timothy': ['Paul', 'Timothy', 'Elders', 'Deacons'],
  '2 Timothy': ['Paul', 'Timothy', 'Onesiphorus', 'Demas'],
  Titus: ['Paul', 'Titus', 'Elders', 'Cretans'],
  Philemon: ['Paul', 'Philemon', 'Onesimus', 'Apphia'],
  Hebrews: ['Jesus', 'Moses', 'Abraham', 'Melchizedek'],
  James: ['James', 'Abraham', 'Rahab', 'Elijah'],
  '1 Peter': ['Peter', 'Jesus', 'Elders', 'Suffering Christians'],
  '2 Peter': ['Peter', 'Paul', 'False Teachers', 'Scoffers'],
  '1 John': ['John', 'Jesus', 'Antichrist', 'Children of God'],
  '2 John': ['John', 'Elect Lady', 'Children', 'Deceivers'],
  '3 John': ['John', 'Gaius', 'Diotrephes', 'Demetrius'],
  Jude: ['Jude', 'Michael', 'Enoch', 'False Teachers'],
  Revelation: ['John', 'Jesus', 'Angels', 'Beast'],
}

function convertBook(bookName, bookData) {
  const metadata = bookMetadata[bookName]
  if (!metadata) {
    console.warn(`No metadata found for book: ${bookName}`)
    return null
  }

  const chapters = []
  const verses = []
  let totalVerses = 0

  // Process each chapter
  Object.keys(bookData).forEach((chapterNum) => {
    const chapterData = bookData[chapterNum]
    const chapterVerses = []

    // Process each verse in the chapter
    Object.keys(chapterData).forEach((verseNum) => {
      const verseText = chapterData[verseNum]
      const verseId = `kjv_${metadata.id}_${chapterNum}_${verseNum}`

      const verse = {
        id: verseId,
        translation: 'kjv',
        book: metadata.id,
        bookName: bookName,
        chapter: parseInt(chapterNum),
        verse: parseInt(verseNum),
        text: verseText,
        paragraph: Math.ceil(parseInt(verseNum) / 5),
      }

      chapterVerses.push(verse)
      verses.push(verse)
      totalVerses++
    })

    chapters.push({
      number: parseInt(chapterNum),
      summary: `Chapter ${chapterNum} of ${bookName}`,
      verses: chapterVerses,
    })
  })

  // Create book structure
  const book = {
    id: metadata.id,
    name: bookName,
    testament: metadata.testament,
    order: metadata.order,
    chapterCount: chapters.length,
    verseCount: totalVerses,
    summary: {
      short: `${bookName} contains ${chapters.length} chapters`,
      long: `${bookName} is a book of the ${metadata.testament === 'new' ? 'New Testament' : 'Old Testament'}.`,
      keyThemes: bookThemes[bookName] || [],
      keyCharacters: bookCharacters[bookName] || [],
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

function convertKJVData() {
  const inputDir = './src/data/KJV/KJV_books'
  const outputDir = './src/data/converted'

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const convertedBooks = []
  const allVerses = []

  // Get list of JSON files in KJV_books directory
  const files = fs.readdirSync(inputDir).filter((file) => file.endsWith('.json'))

  console.log(`Found ${files.length} books to convert...`)

  files.forEach((file) => {
    const filePath = path.join(inputDir, file)
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

      const converted = convertBook(bookName, bookData)
      if (converted) {
        convertedBooks.push(converted.book)
        allVerses.push(...converted.verses)

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
          `✓ Converted ${bookName} (${converted.book.chapterCount} chapters, ${converted.book.verseCount} verses)`,
        )
      }
    } catch (error) {
      console.error(`Error converting ${bookName}:`, error.message)
    }
  })

  // Save combined data
  fs.writeFileSync(path.join(outputDir, 'allBooks.json'), JSON.stringify(convertedBooks, null, 2))
  fs.writeFileSync(path.join(outputDir, 'allVerses.json'), JSON.stringify(allVerses, null, 2))

  console.log(`\n🎉 Conversion complete!`)
  console.log(`📁 Output directory: ${outputDir}`)
  console.log(`📚 Converted ${convertedBooks.length} books`)
  console.log(`📝 Total verses: ${allVerses.length}`)
  console.log(`\nFiles created:`)
  console.log(`- allBooks.json (combined book data)`)
  console.log(`- allVerses.json (all verses)`)
  console.log(`- Individual book files (e.g., matthewBook.json, matthewVerses.json)`)
}

// Run the conversion
convertKJVData()
