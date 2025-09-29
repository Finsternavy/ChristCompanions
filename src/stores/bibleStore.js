import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import booksList from '@/models/bibleStructure/booksList.json'
import bookSummaries from '@/data/bookSummaries.json'

export const useBibleStore = defineStore('bibleStore', () => {
  const bookData = ref(null)
  const chapterData = ref(null)
  const versesData = ref(null)
  const activeChapter = ref(null)
  const compiledData = ref(null)
  const currentBookId = ref(null)
  const currentVersion = ref(null)
  const activeVerse = ref(null)
  const isLoading = ref(false)

  // User content - arrays to support multiple notes/questions per verse
  const userNotes = ref([])
  const userQuestions = ref([])
  const chapterNotes = ref([])
  const chapterQuestions = ref([])
  const bookNotes = ref([])
  const bookQuestions = ref([])
  const activeNote = ref(null)
  const activeQuestions = ref(null)

  // Clean up any old object-based structure on store initialization
  if (userNotes.value && typeof userNotes.value === 'object' && !Array.isArray(userNotes.value)) {
    userNotes.value = []
  }
  if (
    userQuestions.value &&
    typeof userQuestions.value === 'object' &&
    !Array.isArray(userQuestions.value)
  ) {
    userQuestions.value = []
  }

  // Verse comparison
  const comparisonCache = ref({})
  const availableVersions = ref([
    { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
    { id: 'niv', name: 'New International Version', abbreviation: 'NIV' },
    { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV' },
    { id: 'nasb', name: 'New American Standard Bible', abbreviation: 'NASB' },
    { id: 'nlt', name: 'New Living Translation', abbreviation: 'NLT' },
    { id: 'nkjv', name: 'New King James Version', abbreviation: 'NKJV' },
    { id: 'net', name: 'New English Translation', abbreviation: 'NET' },
    { id: 'web', name: 'World English Bible', abbreviation: 'WEB' },
    { id: 'akjv', name: 'American King James Version', abbreviation: 'AKJV' },
    { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV' },
    { id: 'brg', name: 'Bible in Basic English', abbreviation: 'BRG' },
    { id: 'ehv', name: 'Evangelical Heritage Version', abbreviation: 'EHV' },
    { id: 'esvuk', name: 'English Standard Version (UK)', abbreviation: 'ESVUK' },
    { id: 'gnv', name: 'Geneva Bible', abbreviation: 'GNV' },
    { id: 'gw', name: "God's Word", abbreviation: 'GW' },
    { id: 'isv', name: 'International Standard Version', abbreviation: 'ISV' },
    { id: 'jub', name: 'Jubilee Bible', abbreviation: 'JUB' },
    { id: 'kj21', name: '21st Century King James Version', abbreviation: 'KJ21' },
    { id: 'leb', name: 'Lexham English Bible', abbreviation: 'LEB' },
    { id: 'mev', name: 'Modern English Version', abbreviation: 'MEV' },
    { id: 'nasb1995', name: 'New American Standard Bible (1995)', abbreviation: 'NASB1995' },
    { id: 'nivuk', name: 'New International Version (UK)', abbreviation: 'NIVUK' },
    { id: 'nlv', name: 'New Life Version', abbreviation: 'NLV' },
    { id: 'nog', name: 'Names of God Bible', abbreviation: 'NOG' },
    { id: 'nrsv', name: 'New Revised Standard Version', abbreviation: 'NRSV' },
    { id: 'nrsvue', name: 'New Revised Standard Version Updated Edition', abbreviation: 'NRSVUE' },
    { id: 'ylt', name: "Young's Literal Translation", abbreviation: 'YLT' },
  ])

  // Cache for loaded data
  const dataCache = ref({})

  // Dynamic import mapping for individual book files
  const getBookDataImport = async (versionId, bookId) => {
    const versionMappings = {
      kjv: () => import(`../data/converted/KJV/${bookId}Book.json`),
      niv: () => import(`../data/converted/NIV/${bookId}Book.json`),
      esv: () => import(`../data/converted/ESV/${bookId}Book.json`),
      nasb: () => import(`../data/converted/NASB/${bookId}Book.json`),
      nlt: () => import(`../data/converted/NLT/${bookId}Book.json`),
      nkjv: () => import(`../data/converted/NKJV/${bookId}Book.json`),
      net: () => import(`../data/converted/NET/${bookId}Book.json`),
      web: () => import(`../data/converted/WEB/${bookId}Book.json`),
      akjv: () => import(`../data/converted/AKJV/${bookId}Book.json`),
      asv: () => import(`../data/converted/ASV/${bookId}Book.json`),
      brg: () => import(`../data/converted/BRG/${bookId}Book.json`),
      ehv: () => import(`../data/converted/EHV/${bookId}Book.json`),
      esvuk: () => import(`../data/converted/ESVUK/${bookId}Book.json`),
      gnv: () => import(`../data/converted/GNV/${bookId}Book.json`),
      gw: () => import(`../data/converted/GW/${bookId}Book.json`),
      isv: () => import(`../data/converted/ISV/${bookId}Book.json`),
      jub: () => import(`../data/converted/JUB/${bookId}Book.json`),
      kj21: () => import(`../data/converted/KJ21/${bookId}Book.json`),
      leb: () => import(`../data/converted/LEB/${bookId}Book.json`),
      mev: () => import(`../data/converted/MEV/${bookId}Book.json`),
      nasb1995: () => import(`../data/converted/NASB1995/${bookId}Book.json`),
      nivuk: () => import(`../data/converted/NIVUK/${bookId}Book.json`),
      nlv: () => import(`../data/converted/NLV/${bookId}Book.json`),
      nog: () => import(`../data/converted/NOG/${bookId}Book.json`),
      nrsv: () => import(`../data/converted/NRSV/${bookId}Book.json`),
      nrsvue: () => import(`../data/converted/NRSVUE/${bookId}Book.json`),
      ylt: () => import(`../data/converted/YLT/${bookId}Book.json`),
    }

    const versionImport = versionMappings[versionId.toLowerCase()]
    if (!versionImport) {
      throw new Error(`Version ${versionId} not supported`)
    }

    const bookData = await versionImport()
    return bookData.default
  }

  const getVersesDataImport = async (versionId, bookId) => {
    const versionMappings = {
      kjv: () => import(`../data/converted/KJV/${bookId}Verses.json`),
      niv: () => import(`../data/converted/NIV/${bookId}Verses.json`),
      esv: () => import(`../data/converted/ESV/${bookId}Verses.json`),
      nasb: () => import(`../data/converted/NASB/${bookId}Verses.json`),
      nlt: () => import(`../data/converted/NLT/${bookId}Verses.json`),
      nkjv: () => import(`../data/converted/NKJV/${bookId}Verses.json`),
      net: () => import(`../data/converted/NET/${bookId}Verses.json`),
      web: () => import(`../data/converted/WEB/${bookId}Verses.json`),
      akjv: () => import(`../data/converted/AKJV/${bookId}Verses.json`),
      asv: () => import(`../data/converted/ASV/${bookId}Verses.json`),
      brg: () => import(`../data/converted/BRG/${bookId}Verses.json`),
      ehv: () => import(`../data/converted/EHV/${bookId}Verses.json`),
      esvuk: () => import(`../data/converted/ESVUK/${bookId}Verses.json`),
      gnv: () => import(`../data/converted/GNV/${bookId}Verses.json`),
      gw: () => import(`../data/converted/GW/${bookId}Verses.json`),
      isv: () => import(`../data/converted/ISV/${bookId}Verses.json`),
      jub: () => import(`../data/converted/JUB/${bookId}Verses.json`),
      kj21: () => import(`../data/converted/KJ21/${bookId}Verses.json`),
      leb: () => import(`../data/converted/LEB/${bookId}Verses.json`),
      mev: () => import(`../data/converted/MEV/${bookId}Verses.json`),
      nasb1995: () => import(`../data/converted/NASB1995/${bookId}Verses.json`),
      nivuk: () => import(`../data/converted/NIVUK/${bookId}Verses.json`),
      nlv: () => import(`../data/converted/NLV/${bookId}Verses.json`),
      nog: () => import(`../data/converted/NOG/${bookId}Verses.json`),
      nrsv: () => import(`../data/converted/NRSV/${bookId}Verses.json`),
      nrsvue: () => import(`../data/converted/NRSVUE/${bookId}Verses.json`),
      ylt: () => import(`../data/converted/YLT/${bookId}Verses.json`),
    }

    const versionImport = versionMappings[versionId.toLowerCase()]
    if (!versionImport) {
      throw new Error(`Version ${versionId} not supported`)
    }

    const versesData = await versionImport()
    return versesData.default
  }

  // Initialize default version
  const initializeDefaultVersion = () => {
    if (!currentVersion.value) {
      currentVersion.value = { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' }
    }
  }

  // Load book data dynamically from converted JSON files
  const loadBookData = async (bookId, versionId = 'kjv') => {
    const cacheKey = `${versionId}_${bookId}`

    // Check cache first
    if (dataCache.value[cacheKey]) {
      return dataCache.value[cacheKey]
    }

    try {
      // Load the specific book and verses data
      const [bookData, versesData] = await Promise.all([
        getBookDataImport(versionId, bookId),
        getVersesDataImport(versionId, bookId),
      ])

      const result = { bookData, versesData }

      // Cache the result
      dataCache.value[cacheKey] = result

      return result
    } catch (error) {
      console.error(`Error loading book data for ${bookId} in ${versionId}:`, error)
      throw error
    }
  }

  const compileData = async (book, versionId = 'kjv') => {
    if (!book || !book.id) {
      console.error(`Invalid book: ${book?.id}`)
      return
    }

    isLoading.value = true
    try {
      const { bookData: loadedBookData, versesData: loadedVersesData } = await loadBookData(
        book.id,
        versionId,
      )

      bookData.value = loadedBookData
      chapterData.value = loadedBookData.chapters
      versesData.value = loadedVersesData
      currentBookId.value = book.id
      // Don't overwrite currentVersion here - it should already be set properly

      // Compile the data
      const data = chapterData.value.map((chapter) => ({
        ...chapter,
        verses: versesData.value.filter((verse) => verse.chapter === chapter.number),
      }))

      compiledData.value = data

      // Set the first chapter as active
      if (data.length > 0) {
        activeChapter.value = data[0]
      }

      return data
    } catch (error) {
      console.error(`Failed to compile data for ${book.id}:`, error)
    } finally {
      isLoading.value = false
    }
  }

  async function setBookData(book) {
    // Initialize default version if not set
    initializeDefaultVersion()

    // Clear active verse when switching books
    setActiveVerse(null)
    currentBookId.value = book.id
    await compileData(book, currentVersion.value?.id || 'kjv')
  }

  async function setBibleVersion(version) {
    currentVersion.value = version

    // If we have a current book, reload it with the new version
    if (currentBookId.value) {
      const currentBook = booksList.find((book) => book.id === currentBookId.value)
      if (currentBook) {
        await setBookData(currentBook)
      }
    }
  }

  function setChapterData(data) {
    chapterData.value = data
  }

  function setVersesData(data) {
    versesData.value = data
  }

  function setActiveChapter(chapter) {
    activeChapter.value = chapter
  }

  // Get available books
  function getAvailableBooks() {
    return booksList
  }

  // Check if a book is available
  function isBookAvailable(bookId) {
    return booksList.some((book) => book.id.toLowerCase() === bookId.toLowerCase())
  }

  // Get current book info
  function getCurrentBook() {
    return {
      id: currentBookId.value,
      data: bookData.value,
    }
  }

  // Helper function to get note key from verse (use version-independent key)
  function getNoteKeyFromVerse(verse) {
    // Always use version-independent key: book_chapter_verse
    return `${verse.book || currentBookId.value}_${verse.chapter}_${verse.verse}`
  }

  // Helper function to get chapter note key
  function getChapterNoteKey(bookId, chapterNumber) {
    return `${bookId}_chapter_${chapterNumber}`
  }

  // Helper function to get book note key
  function getBookNoteKey(bookId) {
    return `${bookId}_book`
  }

  // Set active verse
  function setActiveVerse(verse) {
    activeVerse.value = verse

    if (verse) {
      // Find existing note for this verse
      const existingNote = userNotes.value.find(
        (note) =>
          note.book === currentBookId.value &&
          note.chapter === activeChapter.value?.number &&
          note.verse === verse.verse,
      )

      // Find existing question for this verse
      const existingQuestion = userQuestions.value.find(
        (question) =>
          question.book === currentBookId.value &&
          question.chapter === activeChapter.value?.number &&
          question.verse === verse.verse,
      )

      // Set active note and questions
      activeNote.value = existingNote || null
      activeQuestions.value = existingQuestion || null
    } else {
      activeNote.value = null
      activeQuestions.value = null
    }
  }

  // Navigate to a specific verse from a note
  function navigateToVerseFromNote(note) {
    const targetBook = note.book
    const targetChapter = note.chapter
    const targetVerse = note.verse

    // Convert book name to book ID (lowercase)
    const targetBookId = targetBook.toLowerCase()

    // Check if we need to switch books
    if (targetBookId && targetBookId !== currentBookId.value) {
      if (!isBookAvailable(targetBookId)) {
        console.error(`Book ${targetBookId} is not available`)
        return
      }

      // Switch to the correct book
      setBookData({ id: targetBookId })

      // Wait for data compilation, then navigate
      setTimeout(() => {
        navigateToSpecificVerse(targetBookId, targetChapter, targetVerse)
      }, 50)
    } else {
      // Book is already correct, navigate immediately
      navigateToSpecificVerse(targetBookId, targetChapter, targetVerse)
    }
  }

  // Navigate to a specific verse within the current book
  function navigateToSpecificVerse(book, chapter, verse) {
    // Find the correct chapter in the compiled data
    const targetChapter = compiledData.value?.find((c) => c.number === chapter)
    if (!targetChapter) {
      console.error(`Chapter ${chapter} not found in book ${book}`)
      return
    }

    // Find the target verse in the chapter
    const targetVerse = targetChapter.verses.find((v) => v.verse === verse)
    if (!targetVerse) {
      console.error(`Verse ${verse} not found in chapter ${chapter}`)
      return
    }

    // Check if this is the same verse that's already active
    const currentVerse = activeVerse.value
    if (
      currentVerse &&
      currentVerse.verse === targetVerse.verse &&
      currentVerse.chapter === chapter &&
      currentBookId.value === book
    ) {
      setActiveVerse(null)
      return
    }

    // Set the active chapter first
    setActiveChapter(targetChapter)

    // Create verse with proper context and set as active
    setActiveVerse({
      ...targetVerse,
      book: book,
      chapter: chapter,
    })
  }

  // Add or update a note
  function addOrUpdateNote(verse, noteText, noteId = null) {
    const noteKey = getNoteKeyFromVerse(verse)

    if (noteId) {
      // Update existing note
      const existingIndex = userNotes.value.findIndex((note) => note.id === noteId)
      if (existingIndex !== -1) {
        userNotes.value[existingIndex].text = noteText
        return userNotes.value[existingIndex]
      }
    }

    // Add new note
    const newNote = {
      id: noteId || crypto.randomUUID(),
      text: noteText,
      book: currentBookId.value,
      chapter: activeChapter.value?.number,
      verse: verse.verse,
      noteKey: noteKey,
    }
    userNotes.value.push(newNote)
    console.log('userNotes.value', userNotes.value)
    return newNote
  }

  // Add or update a question
  function addOrUpdateQuestion(verse, questionText, questionId = null) {
    const noteKey = getNoteKeyFromVerse(verse)

    if (questionId) {
      // Update existing question
      const existingIndex = userQuestions.value.findIndex((question) => question.id === questionId)
      if (existingIndex !== -1) {
        userQuestions.value[existingIndex].text = questionText
        return userQuestions.value[existingIndex]
      }
    }

    // Add new question
    const newQuestion = {
      id: questionId || crypto.randomUUID(),
      text: questionText,
      book: currentBookId.value,
      chapter: activeChapter.value?.number,
      verse: verse.verse,
      noteKey: noteKey,
    }
    userQuestions.value.push(newQuestion)
    return newQuestion
  }

  // Delete a note
  function deleteNote(noteId) {
    const index = userNotes.value.findIndex((note) => note.id === noteId)
    if (index !== -1) {
      userNotes.value.splice(index, 1)
    }
  }

  // Delete a question
  function deleteQuestion(questionId) {
    const index = userQuestions.value.findIndex((question) => question.id === questionId)
    if (index !== -1) {
      userQuestions.value.splice(index, 1)
    }
  }

  // Delete a chapter note
  function deleteChapterNote(noteId) {
    const index = chapterNotes.value.findIndex((note) => note.id === noteId)
    if (index !== -1) {
      chapterNotes.value.splice(index, 1)
    }
  }

  // Delete a chapter question
  function deleteChapterQuestion(questionId) {
    const index = chapterQuestions.value.findIndex((question) => question.id === questionId)
    if (index !== -1) {
      chapterQuestions.value.splice(index, 1)
    }
  }

  // Delete a book note
  function deleteBookNote(noteId) {
    const index = bookNotes.value.findIndex((note) => note.id === noteId)
    if (index !== -1) {
      bookNotes.value.splice(index, 1)
    }
  }

  // Delete a book question
  function deleteBookQuestion(questionId) {
    const index = bookQuestions.value.findIndex((question) => question.id === questionId)
    if (index !== -1) {
      bookQuestions.value.splice(index, 1)
    }
  }

  // Add or update a chapter note
  function addOrUpdateChapterNote(bookId, chapterNumber, noteText, noteId = null) {
    const noteKey = getChapterNoteKey(bookId, chapterNumber)

    if (noteId) {
      // Update existing note
      const existingIndex = chapterNotes.value.findIndex((note) => note.id === noteId)
      if (existingIndex !== -1) {
        chapterNotes.value[existingIndex].text = noteText
        return chapterNotes.value[existingIndex]
      }
    }

    // Add new note
    const newNote = {
      id: noteId || crypto.randomUUID(),
      text: noteText,
      book: bookId,
      chapter: chapterNumber,
      noteKey: noteKey,
    }
    chapterNotes.value.push(newNote)
    return newNote
  }

  // Add or update a chapter question
  function addOrUpdateChapterQuestion(bookId, chapterNumber, questionText, questionId = null) {
    const noteKey = getChapterNoteKey(bookId, chapterNumber)

    if (questionId) {
      // Update existing question
      const existingIndex = chapterQuestions.value.findIndex(
        (question) => question.id === questionId,
      )
      if (existingIndex !== -1) {
        chapterQuestions.value[existingIndex].text = questionText
        return chapterQuestions.value[existingIndex]
      }
    }

    // Add new question
    const newQuestion = {
      id: questionId || crypto.randomUUID(),
      text: questionText,
      book: bookId,
      chapter: chapterNumber,
      noteKey: noteKey,
    }
    chapterQuestions.value.push(newQuestion)
    return newQuestion
  }

  // Add or update a book note
  function addOrUpdateBookNote(bookId, noteText, noteId = null) {
    const noteKey = getBookNoteKey(bookId)

    if (noteId) {
      // Update existing note
      const existingIndex = bookNotes.value.findIndex((note) => note.id === noteId)
      if (existingIndex !== -1) {
        bookNotes.value[existingIndex].text = noteText
        return bookNotes.value[existingIndex]
      }
    }

    // Add new note
    const newNote = {
      id: noteId || crypto.randomUUID(),
      text: noteText,
      book: bookId,
      noteKey: noteKey,
    }
    bookNotes.value.push(newNote)
    return newNote
  }

  // Add or update a book question
  function addOrUpdateBookQuestion(bookId, questionText, questionId = null) {
    const noteKey = getBookNoteKey(bookId)

    if (questionId) {
      // Update existing question
      const existingIndex = bookQuestions.value.findIndex((question) => question.id === questionId)
      if (existingIndex !== -1) {
        bookQuestions.value[existingIndex].text = questionText
        return bookQuestions.value[existingIndex]
      }
    }

    // Add new question
    const newQuestion = {
      id: questionId || crypto.randomUUID(),
      text: questionText,
      book: bookId,
      noteKey: noteKey,
    }
    bookQuestions.value.push(newQuestion)
    return newQuestion
  }

  // Clean up old object-based structure
  function cleanupNotesStructure() {
    console.log('🧹 Cleaning up notes structure...')
    console.log('Before cleanup:', userNotes.value)

    // Convert any object-based entries to array format
    const arrayNotes = []
    const arrayQuestions = []

    // Handle both array and object structures
    if (Array.isArray(userNotes.value)) {
      userNotes.value.forEach((item) => {
        if (typeof item === 'object' && item.id && item.text && item.text.trim() !== '') {
          arrayNotes.push(item)
        }
      })
    } else if (typeof userNotes.value === 'object') {
      Object.values(userNotes.value).forEach((item) => {
        if (typeof item === 'object' && item.id && item.text && item.text.trim() !== '') {
          arrayNotes.push(item)
        }
      })
    }

    if (Array.isArray(userQuestions.value)) {
      userQuestions.value.forEach((item) => {
        if (typeof item === 'object' && item.id && item.text && item.text.trim() !== '') {
          arrayQuestions.push(item)
        }
      })
    } else if (typeof userQuestions.value === 'object') {
      Object.values(userQuestions.value).forEach((item) => {
        if (typeof item === 'object' && item.id && item.text && item.text.trim() !== '') {
          arrayQuestions.push(item)
        }
      })
    }

    // Replace with clean arrays
    userNotes.value = arrayNotes
    userQuestions.value = arrayQuestions

    console.log('After cleanup:', userNotes.value)
    console.log('✅ Cleanup complete!')
  }

  // Get filtered notes
  function getFilteredNotes() {
    return userNotes.value.filter((note) => note.text)
  }

  // Get filtered questions
  function getFilteredQuestions() {
    return userQuestions.value.filter((question) => question.text)
  }

  // Get filtered chapter notes
  function getFilteredChapterNotes(bookId) {
    return chapterNotes.value.filter((note) => note.text && note.book === bookId)
  }

  // Get filtered chapter questions
  function getFilteredChapterQuestions(bookId) {
    return chapterQuestions.value.filter((question) => question.text && question.book === bookId)
  }

  // Get filtered book notes
  function getFilteredBookNotes(bookId) {
    return bookNotes.value.filter((note) => note.text && note.book === bookId)
  }

  // Get filtered book questions
  function getFilteredBookQuestions(bookId) {
    return bookQuestions.value.filter((question) => question.text && question.book === bookId)
  }

  // Load a specific verse from a different version for comparison
  async function loadVerseComparison(verse, targetVersionId) {
    const cacheKey = `${targetVersionId}_${verse.book}_${verse.chapter}_${verse.verse}`

    // Check cache first
    if (comparisonCache.value[cacheKey]) {
      return comparisonCache.value[cacheKey]
    }

    try {
      // Load the specific verse data from the target version
      const versesData = await getVersesDataImport(targetVersionId, verse.book)

      // Find the specific verse
      const targetVerse = versesData.find(
        (v) => v.chapter === verse.chapter && v.verse === verse.verse,
      )

      if (targetVerse) {
        const result = {
          ...targetVerse,
          version: availableVersions.value.find((v) => v.id === targetVersionId),
          originalVerse: verse,
        }

        // Cache the result
        comparisonCache.value[cacheKey] = result
        return result
      } else {
        throw new Error(`Verse not found in ${targetVersionId}`)
      }
    } catch (error) {
      console.error(
        `Error loading verse comparison for ${verse.book} ${verse.chapter}:${verse.verse} in ${targetVersionId}:`,
        error,
      )
      throw error
    }
  }

  // Get available versions for comparison
  function getAvailableVersions() {
    return availableVersions.value.filter((v) => v.id !== currentVersion.value?.id)
  }

  // Get book summary
  function getBookSummary(bookId) {
    return bookSummaries[bookId] || null
  }

  return {
    bookData,
    chapterData,
    versesData,
    activeChapter,
    compiledData,
    currentBookId,
    currentVersion,
    activeVerse,
    isLoading,
    userNotes,
    userQuestions,
    chapterNotes,
    chapterQuestions,
    bookNotes,
    bookQuestions,
    activeNote,
    activeQuestions,
    setBookData,
    setBibleVersion,
    setChapterData,
    setVersesData,
    setActiveChapter,
    setActiveVerse,
    getAvailableBooks,
    isBookAvailable,
    getCurrentBook,
    navigateToVerseFromNote,
    addOrUpdateNote,
    addOrUpdateQuestion,
    deleteNote,
    deleteQuestion,
    deleteChapterNote,
    deleteChapterQuestion,
    deleteBookNote,
    deleteBookQuestion,
    addOrUpdateChapterNote,
    addOrUpdateChapterQuestion,
    addOrUpdateBookNote,
    addOrUpdateBookQuestion,
    getFilteredNotes,
    getFilteredQuestions,
    getFilteredChapterNotes,
    getFilteredChapterQuestions,
    getFilteredBookNotes,
    getFilteredBookQuestions,
    cleanupNotesStructure,
    loadVerseComparison,
    getAvailableVersions,
    availableVersions,
    getBookSummary,
  }
})
