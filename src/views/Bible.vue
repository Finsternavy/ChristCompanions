<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ChapterViewer from '@/components/ChapterViewer.vue'
import { useBibleStore } from '@/stores/bibleStore'
import * as HeroIcons from '@heroicons/vue/24/solid'
// use uuidv4
import { v4 as uuidv4 } from 'uuid'
import SideNav from '@/components/SideNav.vue'

const bibleStore = useBibleStore()
const router = useRouter()

const bookData = computed(() => bibleStore.bookData)
const chapterData = computed(() => bibleStore.chapterData)
const versesData = computed(() => bibleStore.versesData)
const compiledData = computed(() => bibleStore.compiledData)
const activeChapter = computed(() => bibleStore.activeChapter)
const currentBookId = computed(() => bibleStore.currentBookId)
const currentVersion = computed(() => bibleStore.currentVersion)
const activeVerse = computed(() => bibleStore.activeVerse)
const activeNote = computed(() => bibleStore.activeNote)
const activeQuestions = computed(() => bibleStore.activeQuestions)
const userNotes = computed(() => bibleStore.userNotes)
const userQuestions = computed(() => bibleStore.userQuestions)

// Book summary
const bookSummary = computed(() => {
  if (currentBookId.value) {
    return bibleStore.getBookSummary(currentBookId.value)
  }
  return null
})

const activeStudyTool = ref('notes')
const activeStudyLevel = ref('verse') // 'verse', 'chapter', 'book'
const tmpNote = ref('')
const tmpQuestion = ref('')
const editingNote = ref(null) // Track which note is being edited
const editingQuestion = ref(null) // Track which question is being edited
const editingNoteText = ref('') // Text for editing note
const editingQuestionText = ref('') // Text for editing question

// Delete confirmation modal
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleteType = ref('') // 'note' or 'question'
const isLoading = computed(() => bibleStore.isLoading)

// Ref for verses container
const versesContainer = ref(null)

// Text-to-speech functionality
const isReading = ref(false)
const currentReadingVerse = ref(null)
const speechQueue = ref([])
const speechRate = ref(1.0)
const availableVoices = ref([])
const selectedVoice = ref(null)
const isReadingSingleVerse = ref(false)
const readingTimeout = ref(null)
const lastReadVerse = ref(null)
const activeVerseSetDuringReading = ref(false)

// Verse comparison functionality
const comparisonData = ref(null)
const isComparisonLoading = ref(false)
const comparisonError = ref(null)
const showComparison = ref(false)
const selectedComparisonVersion = ref('')
const versionSearchQuery = ref('')

// Comparison modal notes/questions
const comparisonNote = ref('')
const comparisonQuestion = ref('')
const comparisonActiveTab = ref('notes')

// Chapter carousel state
const chapterCarouselStart = ref(0)
const chaptersPerView = 5

const filteredUserNotes = computed(() => {
  const allNotes = bibleStore.getFilteredNotes()
  // Filter by current book and sort by chapter, then verse
  return allNotes
    .filter((note) => note.book === currentBookId.value)
    .sort((a, b) => {
      // First sort by chapter
      if (a.chapter !== b.chapter) {
        return a.chapter - b.chapter
      }
      // Then sort by verse
      return a.verse - b.verse
    })
})

const filteredUserQuestions = computed(() => {
  const allQuestions = bibleStore.getFilteredQuestions()
  // Filter by current book and sort by chapter, then verse
  return allQuestions
    .filter((question) => question.book === currentBookId.value)
    .sort((a, b) => {
      // First sort by chapter
      if (a.chapter !== b.chapter) {
        return a.chapter - b.chapter
      }
      // Then sort by verse
      return a.verse - b.verse
    })
})

// Group notes by verse
const groupedUserNotes = computed(() => {
  const notes = filteredUserNotes.value
  const grouped = {}

  notes.forEach((note) => {
    const key = `${note.chapter}_${note.verse}`
    if (!grouped[key]) {
      grouped[key] = {
        chapter: note.chapter,
        verse: note.verse,
        notes: [],
      }
    }
    grouped[key].notes.push(note)
  })

  return Object.values(grouped).sort((a, b) => {
    if (a.chapter !== b.chapter) {
      return a.chapter - b.chapter
    }
    return a.verse - b.verse
  })
})

// Group questions by verse
const groupedUserQuestions = computed(() => {
  const questions = filteredUserQuestions.value
  const grouped = {}

  questions.forEach((question) => {
    const key = `${question.chapter}_${question.verse}`
    if (!grouped[key]) {
      grouped[key] = {
        chapter: question.chapter,
        verse: question.verse,
        questions: [],
      }
    }
    grouped[key].questions.push(question)
  })

  return Object.values(grouped).sort((a, b) => {
    if (a.chapter !== b.chapter) {
      return a.chapter - b.chapter
    }
    return a.verse - b.verse
  })
})

// Chapter level notes and questions
const chapterNotes = computed(() => bibleStore.getFilteredChapterNotes(currentBookId.value))
const chapterQuestions = computed(() => bibleStore.getFilteredChapterQuestions(currentBookId.value))

// Book level notes and questions
const bookNotes = computed(() => bibleStore.getFilteredBookNotes(currentBookId.value))
const bookQuestions = computed(() => bibleStore.getFilteredBookQuestions(currentBookId.value))

// Chapter carousel computed properties
const visibleChapters = computed(() => {
  const chapters = compiledData.value || []
  return chapters.slice(chapterCarouselStart.value, chapterCarouselStart.value + chaptersPerView)
})

const canNavigateLeft = computed(() => chapterCarouselStart.value > 0)
const canNavigateRight = computed(() => {
  const chapters = compiledData.value || []
  return chapterCarouselStart.value + chaptersPerView < chapters.length
})

// Check if we're at the last page of chapters
const isAtLastPage = computed(() => {
  const chapters = compiledData.value || []
  return chapterCarouselStart.value + chaptersPerView >= chapters.length
})

// Chapter navigation button states
const canGoToPreviousChapter = computed(() => {
  if (!compiledData.value || !activeChapter.value) return false
  const currentIndex = compiledData.value.findIndex(
    (chapter) => chapter.number === activeChapter.value.number,
  )
  return currentIndex > 0
})

const canGoToNextChapter = computed(() => {
  if (!compiledData.value || !activeChapter.value) return false
  const currentIndex = compiledData.value.findIndex(
    (chapter) => chapter.number === activeChapter.value.number,
  )
  return currentIndex < compiledData.value.length - 1
})

// Watch for book changes to reset active verse
watch(currentBookId, (newBookId, oldBookId) => {
  if (newBookId !== oldBookId) {
    bibleStore.setActiveVerse(null)
    tmpNote.value = ''
    chapterCarouselStart.value = 0
    // Clear reading position when changing books
    lastReadVerse.value = null
  }
})

// Watch for active chapter changes to center carousel
watch(activeChapter, () => {
  centerOnActiveChapter()
  // Scroll to top of verses container when chapter changes
  nextTick(() => {
    if (versesContainer.value) {
      versesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
  // Don't clear highlighting when chapter changes - only when book changes
})

const setActiveChapter = (chapter, isResuming = false) => {
  // Only clear active verse if we're not currently reading
  if (!isReading.value) {
    bibleStore.setActiveVerse(null)
  }

  // Clear reading position when changing chapters (but not when resuming)
  if (!isResuming && lastReadVerse.value && lastReadVerse.value.chapter !== chapter.number) {
    lastReadVerse.value = null
  }

  bibleStore.setActiveChapter(chapter)
}

const setActiveVerse = (verse) => {
  if (activeVerse.value?.id === verse.id) {
    bibleStore.setActiveVerse(null)
    tmpNote.value = ''
    return
  }

  bibleStore.setActiveVerse(verse)
  tmpNote.value = activeNote.value?.text || ''
  // Clear the flag when manually selecting a verse
  activeVerseSetDuringReading.value = false
  // Auto-switch to verse level when a verse is clicked
  activeStudyLevel.value = 'verse'
}

const findActiveVerse = (note) => {
  bibleStore.navigateToVerseFromNote(note)
  tmpNote.value = activeNote.value?.text || ''

  // Scroll to the verse after navigation
  nextTick(() => {
    setTimeout(() => {
      // Use version-independent key to find the verse
      const versionIndependentKey = `${note.book}_${note.chapter}_${note.verse}`
      const verseElement = document.querySelector(`[data-verse-id$="${versionIndependentKey}"]`)
      if (verseElement) {
        verseElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 100)
  })
}

const findActiveVerseFromQuestion = (question) => {
  bibleStore.navigateToVerseFromNote(question)
  tmpQuestion.value = question.text || ''

  // Scroll to the verse after navigation
  nextTick(() => {
    setTimeout(() => {
      // Use version-independent key to find the verse
      const versionIndependentKey = `${question.book}_${question.chapter}_${question.verse}`
      const verseElement = document.querySelector(`[data-verse-id$="${versionIndependentKey}"]`)
      if (verseElement) {
        verseElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }, 100)
  })
}

// Inline editing functions
const startEditingNote = (note) => {
  editingNote.value = note.id
  editingNoteText.value = note.text || ''
}

const startEditingQuestion = (question) => {
  editingQuestion.value = question.id
  editingQuestionText.value = question.text || ''
}

const cancelEditingNote = () => {
  editingNote.value = null
  editingNoteText.value = ''
}

const cancelEditingQuestion = () => {
  editingQuestion.value = null
  editingQuestionText.value = ''
}

const saveEditedNote = () => {
  if (editingNote.value && editingNoteText.value.trim()) {
    // Find the note in the filtered list
    const note = filteredUserNotes.value.find((n) => n.id === editingNote.value)
    if (note) {
      bibleStore.addOrUpdateNote(note, editingNoteText.value, note.id)
    }
  }
  cancelEditingNote()
}

const saveEditedQuestion = () => {
  if (editingQuestion.value && editingQuestionText.value.trim()) {
    // Find the question in the filtered list
    const question = filteredUserQuestions.value.find((q) => q.id === editingQuestion.value)
    if (question) {
      bibleStore.addOrUpdateQuestion(question, editingQuestionText.value, question.id)
    }
  }
  cancelEditingQuestion()
}

// Delete functions
const deleteNote = (note) => {
  itemToDelete.value = note
  deleteType.value = 'note'
  showDeleteModal.value = true
}

const deleteQuestion = (question) => {
  itemToDelete.value = question
  deleteType.value = 'question'
  showDeleteModal.value = true
}

// Modal functions
const confirmDelete = () => {
  if (deleteType.value === 'note' && itemToDelete.value) {
    bibleStore.deleteNote(itemToDelete.value.id)
  } else if (deleteType.value === 'question' && itemToDelete.value) {
    bibleStore.deleteQuestion(itemToDelete.value.id)
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
  deleteType.value = ''
}

// Chapter carousel navigation functions
const navigateChaptersLeft = () => {
  if (canNavigateLeft.value) {
    chapterCarouselStart.value = Math.max(0, chapterCarouselStart.value - chaptersPerView)
  }
}

const navigateChaptersRight = () => {
  if (canNavigateRight.value) {
    const chapters = compiledData.value || []
    chapterCarouselStart.value = Math.min(
      chapters.length - chaptersPerView,
      chapterCarouselStart.value + chaptersPerView,
    )
  }
}

// Double chevron navigation functions
const navigateToFirstChapters = () => {
  chapterCarouselStart.value = 0
}

const navigateToLastChapters = () => {
  const chapters = compiledData.value || []
  chapterCarouselStart.value = Math.max(0, chapters.length - chaptersPerView)
}

// Text-to-speech functions
const loadVoices = () => {
  availableVoices.value = speechSynthesis.getVoices()
  if (availableVoices.value.length > 0 && !selectedVoice.value) {
    // Prefer Google UK English Male
    const googleUKMale = availableVoices.value.find(
      (voice) =>
        voice.name.includes('Google') &&
        voice.name.includes('UK') &&
        voice.name.includes('Male') &&
        voice.lang === 'en-GB',
    )

    if (googleUKMale) {
      selectedVoice.value = googleUKMale
    } else {
      // Fallback to any UK English voice
      const ukVoice = availableVoices.value.find((voice) => voice.lang === 'en-GB')
      selectedVoice.value = ukVoice || availableVoices.value[0]
    }
  }
}

const startReadingChapter = () => {
  if (!activeChapter.value?.verses) return

  // Stop any current reading
  stopReading()

  // Use the currently selected verse as the starting point
  if (activeVerse.value) {
    console.log('Starting from activeVerse:', activeVerse.value.verse)
    startReadingFromVerse(activeVerse.value)
  } else {
    console.log('No activeVerse, starting from beginning of chapter')
    startReadingFromVerse(null)
  }
}

const startReadingFromVerse = (startVerse) => {
  let startIndex = 0

  if (startVerse) {
    // Find the verse in the current chapter
    const verseIndex = activeChapter.value.verses.findIndex((v) => v.id === startVerse.id)
    if (verseIndex !== -1) {
      startIndex = verseIndex
      console.log('Starting from verse:', startVerse.verse, 'at index:', startIndex)
    } else {
      console.log('Could not find start verse in current chapter, falling back to lastReadVerse')
      // If the selected verse doesn't exist in current chapter, fall back to lastReadVerse
      if (lastReadVerse.value && lastReadVerse.value.chapter === activeChapter.value.number) {
        const lastReadIndex = activeChapter.value.verses.findIndex(
          (v) => v.id === lastReadVerse.value.id,
        )
        if (lastReadIndex !== -1) {
          startIndex = lastReadIndex
          console.log(
            'Falling back to lastReadVerse:',
            lastReadVerse.value.verse,
            'at index:',
            startIndex,
          )
        } else {
          console.log('Could not find lastReadVerse either, starting from beginning')
          startIndex = 0
        }
      } else {
        console.log('No valid lastReadVerse, starting from beginning')
        startIndex = 0
      }
    }
  } else {
    console.log('No start verse, starting from beginning of chapter')
    startIndex = 0
  }

  // Queue verses from the start index to the end
  speechQueue.value = activeChapter.value.verses.slice(startIndex)
  isReading.value = true
  isReadingSingleVerse.value = false
  readNextVerse()
}

const startReadingVerse = () => {
  if (!activeVerse.value) return

  // Stop any current reading
  stopReading()

  // Queue just the active verse
  speechQueue.value = [activeVerse.value]
  isReading.value = true
  isReadingSingleVerse.value = true
  readNextVerse()
}

const readNextVerse = () => {
  if (speechQueue.value.length === 0) {
    // If reading a single verse, stop here
    if (isReadingSingleVerse.value) {
      isReading.value = false
      currentReadingVerse.value = null
      isReadingSingleVerse.value = false
      return
    }

    // Check if we're at the end of a chapter
    const currentChapterIndex = compiledData.value?.findIndex(
      (chapter) => chapter.number === activeChapter.value?.number,
    )

    if (currentChapterIndex !== undefined && currentChapterIndex < compiledData.value.length - 1) {
      // Move to next chapter after 2 second pause
      console.log('=== CHAPTER CHANGE ===')
      console.log('Moving from chapter:', activeChapter.value.number, 'to next chapter')
      console.log(
        'lastReadVerse before chapter change:',
        lastReadVerse.value
          ? `${lastReadVerse.value.chapter}:${lastReadVerse.value.verse}`
          : 'null',
      )

      readingTimeout.value = setTimeout(() => {
        if (isReading.value) {
          const nextChapter = compiledData.value[currentChapterIndex + 1]
          console.log('Switching to chapter:', nextChapter.number)
          setActiveChapter(nextChapter, true) // Pass isResuming = true to preserve lastReadVerse

          // Set the first verse of the next chapter as the activeVerse
          if (nextChapter.verses.length > 0) {
            bibleStore.setActiveVerse(nextChapter.verses[0])
            activeVerseSetDuringReading.value = true
            console.log(
              'activeVerse set to first verse of next chapter:',
              nextChapter.verses[0].verse,
            )
          }

          // Queue all verses in the next chapter
          speechQueue.value = [...nextChapter.verses]
          readNextVerse()
        }
      }, 2000)
    } else {
      // End of book reached
      console.log('=== END OF BOOK ===')
      isReading.value = false
      currentReadingVerse.value = null
    }
    return
  }

  const verse = speechQueue.value.shift()
  currentReadingVerse.value = verse

  // Set the activeVerse to the current verse being read
  bibleStore.setActiveVerse(verse)
  activeVerseSetDuringReading.value = true

  console.log('=== READING VERSE ===')
  console.log('Current verse being read:', verse.chapter, ':', verse.verse)
  console.log('activeVerse set to:', activeVerse.value.verse)
  console.log('activeChapter:', activeChapter.value.number)

  // Scroll to the verse being read
  nextTick(() => {
    const verseElement = document.querySelector(`[data-verse-id="${verse.id}"]`)
    if (verseElement) {
      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  })

  const utterance = new SpeechSynthesisUtterance(verse.text)
  utterance.rate = speechRate.value
  utterance.voice = selectedVoice.value

  utterance.onend = () => {
    // 0.5 second pause between verses
    readingTimeout.value = setTimeout(() => {
      if (isReading.value) {
        readNextVerse()
      }
    }, 500)
  }

  utterance.onerror = () => {
    console.error('Speech synthesis error')
    isReading.value = false
    currentReadingVerse.value = null
  }

  speechSynthesis.speak(utterance)
}

const pauseReading = () => {
  speechSynthesis.pause()
}

const resumeReading = () => {
  speechSynthesis.resume()
}

const stopReading = () => {
  // Cancel any ongoing speech
  speechSynthesis.cancel()

  // Clear any pending timeouts
  if (readingTimeout.value) {
    clearTimeout(readingTimeout.value)
    readingTimeout.value = null
  }

  console.log('=== STOP READING DEBUG ===')
  console.log('Stopped reading at verse:', currentReadingVerse.value?.verse || 'none')
  console.log('activeVerse is now:', activeVerse.value?.verse || 'none')

  // Clear all reading states
  isReading.value = false
  currentReadingVerse.value = null
  isReadingSingleVerse.value = false
  speechQueue.value = []
  activeVerseSetDuringReading.value = false
}

const setSpeechRate = (rate) => {
  speechRate.value = rate
  if (isReading.value) {
    // Update current utterance if reading
    speechSynthesis.cancel()
    readNextVerse()
  }
}

const centerOnActiveChapter = () => {
  if (activeChapter.value) {
    const chapterIndex =
      compiledData.value?.findIndex((c) => c.number === activeChapter.value.number) || 0
    chapterCarouselStart.value = Math.max(0, chapterIndex - Math.floor(chaptersPerView / 2))
  }
}

// Chapter navigation functions
const goToPreviousChapter = () => {
  if (!compiledData.value || !activeChapter.value) return

  const currentIndex = compiledData.value.findIndex(
    (chapter) => chapter.number === activeChapter.value.number,
  )
  if (currentIndex > 0) {
    const previousChapter = compiledData.value[currentIndex - 1]
    setActiveChapter(previousChapter)
    // Scroll to top of verses container
    nextTick(() => {
      if (versesContainer.value) {
        versesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }
}

const goToNextChapter = () => {
  if (!compiledData.value || !activeChapter.value) return

  const currentIndex = compiledData.value.findIndex(
    (chapter) => chapter.number === activeChapter.value.number,
  )
  if (currentIndex < compiledData.value.length - 1) {
    const nextChapter = compiledData.value[currentIndex + 1]
    setActiveChapter(nextChapter)
    // Scroll to top of verses container
    nextTick(() => {
      if (versesContainer.value) {
        versesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }
}

const cancelNote = () => {
  tmpNote.value = ''
}

const addNote = () => {
  const note = bibleStore.addOrUpdateNote(activeVerse.value, tmpNote.value, uuidv4())
  tmpNote.value = ''
}

const updateNote = () => {
  bibleStore.addOrUpdateNote(activeVerse.value, tmpNote.value, activeNote.value.id)
}

const cancelQuestion = () => {
  tmpQuestion.value = ''
}

const addQuestion = () => {
  bibleStore.addOrUpdateQuestion(activeVerse.value, tmpQuestion.value, uuidv4())
  tmpQuestion.value = ''
}

// Chapter level note/question functions
const addChapterNote = () => {
  bibleStore.addOrUpdateChapterNote(
    currentBookId.value,
    activeChapter.value.number,
    tmpNote.value,
    uuidv4(),
  )
  tmpNote.value = ''
}

const addChapterQuestion = () => {
  bibleStore.addOrUpdateChapterQuestion(
    currentBookId.value,
    activeChapter.value.number,
    tmpQuestion.value,
    uuidv4(),
  )
  tmpQuestion.value = ''
}

// Book level note/question functions
const addBookNote = () => {
  bibleStore.addOrUpdateBookNote(currentBookId.value, tmpNote.value, uuidv4())
  tmpNote.value = ''
}

const addBookQuestion = () => {
  bibleStore.addOrUpdateBookQuestion(currentBookId.value, tmpQuestion.value, uuidv4())
  tmpQuestion.value = ''
}

// Dynamic add functions based on level
const addNoteForLevel = () => {
  if (activeStudyLevel.value === 'verse') {
    addNote()
  } else if (activeStudyLevel.value === 'chapter') {
    addChapterNote()
  } else if (activeStudyLevel.value === 'book') {
    addBookNote()
  }
}

const addQuestionForLevel = () => {
  if (activeStudyLevel.value === 'verse') {
    addQuestion()
  } else if (activeStudyLevel.value === 'chapter') {
    addChapterQuestion()
  } else if (activeStudyLevel.value === 'book') {
    addBookQuestion()
  }
}

// Navigate to a specific verse
const navigateToVerse = (verse) => {
  // Find the chapter in compiled data
  const chapter = compiledData.value?.find((c) => c.number === verse.chapterNumber)
  if (chapter) {
    setActiveChapter(chapter)
    // Find and set the specific verse
    const targetVerse = chapter.verses.find((v) => v.verse === verse.verse)
    if (targetVerse) {
      setActiveVerse(targetVerse)
      // Scroll to the verse after a short delay to ensure DOM is updated
      nextTick(() => {
        setTimeout(() => {
          scrollToVerse(targetVerse.id)
        }, 100)
      })
    }
  }
}

// Scroll to a specific verse
const scrollToVerse = (verseId) => {
  const verseElement = document.querySelector(`[data-verse-id="${verseId}"]`)
  if (verseElement) {
    verseElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}

// Verse comparison functions
const openComparison = async (verse, targetVersionId) => {
  try {
    isComparisonLoading.value = true
    comparisonError.value = null

    const comparison = await bibleStore.loadVerseComparison(verse, targetVersionId)
    comparisonData.value = comparison
    showComparison.value = true
  } catch (error) {
    comparisonError.value = error.message
    console.error('Error loading verse comparison:', error)
  } finally {
    isComparisonLoading.value = false
  }
}

const closeComparison = () => {
  showComparison.value = false
  comparisonData.value = null
  comparisonError.value = null
  selectedComparisonVersion.value = ''
  versionSearchQuery.value = ''
  comparisonNote.value = ''
  comparisonQuestion.value = ''
  comparisonActiveTab.value = 'notes'
}

// Get notes/questions for the comparison verse
const getComparisonVerseNote = () => {
  if (!comparisonData.value) return null
  const verse = comparisonData.value.originalVerse
  const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`
  return bibleStore.userNotes[noteKey] || null
}

const getComparisonVerseQuestion = () => {
  if (!comparisonData.value) return null
  const verse = comparisonData.value.originalVerse
  const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`
  return bibleStore.userQuestions[noteKey] || null
}

// Save comparison note
const saveComparisonNote = () => {
  if (!comparisonData.value) return
  const verse = comparisonData.value.originalVerse
  const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`

  if (comparisonNote.value.trim()) {
    bibleStore.addOrUpdateNote(verse, comparisonNote.value, bibleStore.userNotes[noteKey]?.id)
  }
}

// Save comparison question
const saveComparisonQuestion = () => {
  if (!comparisonData.value) return
  const verse = comparisonData.value.originalVerse
  const noteKey = `${verse.book}_${verse.chapter}_${verse.verse}`

  if (comparisonQuestion.value.trim()) {
    bibleStore.addOrUpdateQuestion(
      verse,
      comparisonQuestion.value,
      bibleStore.userQuestions[noteKey]?.id,
    )
  }
}

// Top 5 most common Bible versions
const popularVersions = computed(() => {
  const popularIds = ['kjv', 'niv', 'esv', 'nasb', 'nlt']
  return bibleStore.getAvailableVersions().filter((version) => popularIds.includes(version.id))
})

// Other versions (excluding popular ones)
const otherVersions = computed(() => {
  const popularIds = ['kjv', 'niv', 'esv', 'nasb', 'nlt']
  return bibleStore.getAvailableVersions().filter((version) => !popularIds.includes(version.id))
})

// Filtered versions for comparison (other versions only)
const filteredComparisonVersions = computed(() => {
  if (!versionSearchQuery.value) return otherVersions.value

  return otherVersions.value.filter(
    (version) =>
      version.name.toLowerCase().includes(versionSearchQuery.value.toLowerCase()) ||
      version.abbreviation.toLowerCase().includes(versionSearchQuery.value.toLowerCase()),
  )
})

onMounted(async () => {
  // Initialize with Genesis if no book is selected
  if (!bookData.value) {
    await bibleStore.setBookData({ id: 'genesis' })
  }

  // Load available voices
  loadVoices()

  // Listen for voice changes
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = loadVoices
  }
})

// Watch for book changes and scroll to top
watch(bookData, () => {
  // Scroll to top when book changes
  nextTick(() => {
    if (versesContainer.value) {
      versesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
})

// Watch for comparison data changes to load notes/questions
watch(comparisonData, () => {
  if (comparisonData.value) {
    const existingNote = getComparisonVerseNote()
    const existingQuestion = getComparisonVerseQuestion()
    comparisonNote.value = existingNote?.text || ''
    comparisonQuestion.value = existingQuestion?.text || ''
  }
})
</script>

<template>
  <div class="flex gap-4 pt-20 px-4 pb-2 h-[calc(100vh-88px)] overflow-hidden">
    <SideNav />
    <div class="w-fit mx-auto flex flex-col gap-4 max-w-[1400px] h-full flex-1">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="w-full bg-white/60 rounded-xl shadow-lg p-8 text-center">
        <div class="flex items-center justify-center gap-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span class="text-sm text-gray-600">Loading Bible data...</span>
        </div>
      </div>
      <div class="flex grow gap-4 min-h-0 flex-1 h-full">
        <div
          class="flex-[3] bg-white/60 rounded-xl shadow-lg p-8 flex flex-col gap-8 min-w-0 min-h-0 overflow-hidden"
        >
          <div class="flex flex-col gap-2">
            <div v-if="activeChapter" class="text-2xl text-center font-bold capitalize">
              {{ activeChapter.book }}
            </div>
            <div class="flex items-center gap-2 mx-auto">
              <!-- Double left chevron (go to first chapters) -->
              <button
                @click="navigateToFirstChapters"
                :disabled="chapterCarouselStart === 0"
                class="p-2 rounded-md transition-colors bg-neutral-20 hover:bg-secondary-lt disabled:opacity-50 disabled:hover:bg-neutral-20"
                title="Go to first chapters"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 19l-7-7 7-7M18 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <!-- Single left navigation arrow -->
              <button
                @click="navigateChaptersLeft"
                :disabled="!canNavigateLeft"
                class="p-2 rounded-md transition-colors bg-neutral-20 hover:bg-secondary-lt disabled:opacity-50 disabled:hover:bg-neutral-20"
                title="Previous chapters"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <!-- Chapter buttons -->
              <div class="flex gap-1 overflow-hidden w-[230px]">
                <TransitionGroup
                  name="chapter-slide"
                  tag="div"
                  class="flex justify-between gap-1 w-full"
                >
                  <button
                    v-for="chapter in visibleChapters"
                    :key="chapter.number"
                    class="w-10 h-8 bg-neutral-20 rounded-md transition-all duration-200 hover:bg-secondary-lt flex items-center justify-center text-sm font-medium flex-shrink-0"
                    :class="{
                      '!bg-secondary': activeChapter?.number === chapter.number,
                    }"
                    @click="setActiveChapter(chapter)"
                  >
                    {{ chapter.number }}
                  </button>
                </TransitionGroup>
              </div>

              <!-- Single right navigation arrow -->
              <button
                @click="navigateChaptersRight"
                :disabled="!canNavigateRight"
                class="p-2 rounded-md transition-colors bg-neutral-20 hover:bg-secondary-lt disabled:opacity-50 disabled:hover:bg-neutral-20"
                title="Next chapters"
              >
                <HeroIcons.ChevronRightIcon class="w-4 h-4" />
              </button>

              <!-- Double right chevron (go to last chapters) -->
              <button
                @click="navigateToLastChapters"
                :disabled="isAtLastPage"
                class="p-2 rounded-md transition-colors bg-neutral-20 hover:bg-secondary-lt disabled:opacity-50 disabled:hover:bg-neutral-20"
                title="Go to last chapters"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 5l7 7-7 7M4 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="activeChapter" class="flex-1 flex flex-col min-h-0">
            <!-- <h2 class="text-xl font-bold">{{ bookData.name }} {{ activeChapter.number }}</h2> -->
            <p class="text-lg text-neutral-70 mb-6">
              {{ bookData.name + ' ' + activeChapter.number }}
            </p>

            <!-- Text-to-Speech Controls -->
            <div class="flex items-center gap-4 mb-4 p-3 bg-neutral-10 rounded-lg">
              <div class="flex items-center gap-2">
                <button
                  v-if="!isReading"
                  @click="startReadingChapter"
                  class="p-2 rounded-md transition-colors bg-neutral-20 hover:bg-secondary-lt"
                  title="Read entire chapter (from active verse if selected)"
                >
                  <HeroIcons.PlayIcon class="w-4 h-4" />
                </button>
                <button
                  v-if="!isReading && activeVerse && !activeVerseSetDuringReading"
                  @click="startReadingVerse"
                  class="p-2 rounded-md transition-colors bg-neutral-20 hover:bg-secondary-lt"
                  title="Read active verse only"
                >
                  <HeroIcons.SpeakerWaveIcon class="w-4 h-4" />
                </button>
                <button
                  v-if="isReading"
                  @click="stopReading"
                  class="p-2 rounded-md transition-colors bg-red-500/20 hover:bg-red-500"
                  title="Stop reading"
                >
                  <HeroIcons.StopIcon class="w-4 h-4" />
                </button>
              </div>

              <div class="flex items-center gap-2">
                <label class="text-sm text-neutral-60">Speed:</label>
                <select
                  v-model="speechRate"
                  @change="setSpeechRate(speechRate)"
                  class="px-2 py-1 text-sm bg-neutral-20 rounded-md border-0 focus:ring-2 focus:ring-secondary"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <label class="text-sm text-neutral-60">Voice:</label>
                <select
                  v-model="selectedVoice"
                  class="px-2 py-1 text-sm bg-neutral-20 rounded-md border-0 focus:ring-2 focus:ring-secondary"
                >
                  <option v-for="voice in availableVoices" :key="voice.name" :value="voice">
                    {{ voice.name }} ({{ voice.lang }})
                  </option>
                </select>
              </div>

              <div v-if="isReading && currentReadingVerse" class="text-sm text-secondary">
                Reading: {{ activeChapter?.book }} {{ activeChapter?.number }}:{{
                  currentReadingVerse.verse
                }}
              </div>
            </div>
            <div class="flex-1 flex flex-col min-h-0">
              <ul
                ref="versesContainer"
                class="flex p-1 flex-col gap-2 overflow-y-auto bg-neutral-20 rounded-md min-h-0 flex-1"
              >
                <li
                  v-for="verse in activeChapter.verses"
                  :key="verse.id"
                  :data-verse-id="verse.id"
                  class="px-2 py-1 hover:bg-secondary-lt rounded-md cursor-pointer"
                  :class="{
                    'bg-green-100 border-l-4 border-green-500':
                      currentReadingVerse?.id === verse.id,
                    'bg-secondary':
                      activeVerse?.id === verse.id && currentReadingVerse?.id !== verse.id,
                    'jesus-speaking':
                      verse.speaker === 'Jesus' && currentReadingVerse?.id !== verse.id,
                    'god-speaking': verse.speaker === 'God' && currentReadingVerse?.id !== verse.id,
                  }"
                  @click="setActiveVerse(verse)"
                >
                  <div class="flex items-start gap-2">
                    <div class="flex-1">
                      <span class="verse-number">{{ verse.verse }}</span>
                      <span
                        class="verse-text"
                        :class="{
                          'jesus-text': verse.speaker === 'Jesus',
                          'god-text': verse.speaker === 'God',
                        }"
                      >
                        {{ verse.text }}
                      </span>
                    </div>
                    <button
                      @click.stop="openComparison(verse, 'niv')"
                      class="text-sm text-black hover:text-white bg-secondary hover:bg-secondary-dk transition-all duration-200 p-2 rounded-md shadow-sm hover:shadow-md font-medium min-w-[32px] h-8 flex items-center justify-center"
                      title="Compare with NIV"
                    >
                      ↔
                    </button>
                  </div>
                </li>
              </ul>

              <!-- Chapter Navigation Controls -->
              <div class="flex items-center justify-between mt-4 px-2">
                <!-- Previous Chapter Button -->
                <button
                  @click="goToPreviousChapter"
                  :disabled="!canGoToPreviousChapter"
                  class="flex items-center gap-2 px-4 py-2 bg-neutral-20 rounded-md transition-all duration-200 hover:bg-secondary-lt disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{
                    'hover:bg-secondary-lt': canGoToPreviousChapter,
                    'cursor-not-allowed': !canGoToPreviousChapter,
                  }"
                >
                  <HeroIcons.ChevronLeftIcon class="w-4 h-4" />
                  <span>Back</span>
                </button>

                <!-- Chapter Info -->
                <div class="flex items-center gap-2">
                  <span class="text-sm text-neutral-60">{{ activeChapter.number }} </span>
                </div>

                <!-- Next Chapter Button -->
                <button
                  @click="goToNextChapter"
                  :disabled="!canGoToNextChapter"
                  class="flex items-center gap-2 px-4 py-2 bg-neutral-20 rounded-md transition-all duration-200 hover:bg-secondary-lt disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{
                    'hover:bg-secondary-lt': canGoToNextChapter,
                    'cursor-not-allowed': !canGoToNextChapter,
                  }"
                >
                  <span>Next</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- {{ versesData }} -->
        </div>
        <div
          class="flex-[1] bg-white/60 rounded-xl shadow-lg p-8 flex flex-col gap-8 overflow-hidden flex-shrink-0 mr-2"
        >
          <!-- Book Summary Section -->
          <div class="flex-shrink-0">
            <h3 class="text-sm font-bold mb-2">Summary</h3>
            <p class="text-xs text-gray-700 leading-relaxed">
              {{ bookSummary?.summary || bookData?.summary?.long || 'No summary available.' }}
            </p>
          </div>

          <div class="flex gap-2">
            <button
              class="flex-1 px-2 py-1 bg-neutral-20 rounded-md w-fit"
              :class="{ '!bg-secondary': activeStudyTool === 'notes' }"
              @click="activeStudyTool = 'notes'"
            >
              Notes
            </button>
            <button
              class="flex-1 px-2 py-1 bg-neutral-20 rounded-md w-fit"
              :class="{ '!bg-secondary': activeStudyTool === 'questions' }"
              @click="activeStudyTool = 'questions'"
            >
              Questions
            </button>
          </div>

          <!-- Study Level Selector -->
          <div class="flex gap-1">
            <button
              class="flex-1 px-2 py-1 text-xs bg-neutral-20 rounded-md"
              :class="{ '!bg-secondary': activeStudyLevel === 'book' }"
              @click="activeStudyLevel = 'book'"
            >
              Book
            </button>
            <button
              class="flex-1 px-2 py-1 text-xs bg-neutral-20 rounded-md"
              :class="{ '!bg-secondary': activeStudyLevel === 'chapter' }"
              @click="activeStudyLevel = 'chapter'"
            >
              Chapter
            </button>
            <button
              class="flex-1 px-2 py-1 text-xs bg-neutral-20 rounded-md"
              :class="{ '!bg-secondary': activeStudyLevel === 'verse' }"
              @click="activeStudyLevel = 'verse'"
            >
              Verse
            </button>
          </div>
          <div
            v-if="activeStudyTool === 'notes'"
            class="min-w-0 h-full justify-between flex flex-col"
          >
            <div>
              <!-- Verse Level Notes -->
              <div v-if="activeStudyLevel === 'verse'">
                <div v-if="filteredUserNotes.length > 0" class="flex flex-col gap-2 rounded-md p-2">
                  <div class="text-sm text-neutral-60 mb-2">
                    {{ filteredUserNotes.length }} verse note{{
                      filteredUserNotes.length !== 1 ? 's' : ''
                    }}
                    for {{ currentBookId }}
                  </div>
                  <ul class="flex flex-col gap-2">
                    <li
                      v-for="group in groupedUserNotes"
                      :key="`${group.chapter}_${group.verse}`"
                      class="bg-neutral-20 p-2 rounded-md transition-colors"
                      :class="{
                        'bg-secondary-lt shadow-md':
                          activeVerse &&
                          activeVerse.chapter === group.chapter &&
                          activeVerse.verse === group.verse,
                      }"
                    >
                      <div class="mb-2">
                        <p class="font-bold text-sm">
                          Chapter {{ group.chapter }}, Verse {{ group.verse }}
                        </p>
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="note in group.notes"
                          :key="note.id"
                          class="p-2 rounded hover:bg-black/5 transition-colors"
                        >
                          <div
                            v-if="editingNote !== note.id"
                            class="cursor-pointer"
                            @click="findActiveVerse(note)"
                          >
                            <div class="flex justify-between items-start">
                              <div class="flex-1">
                                <p class="text-sm text-wrap">{{ note.text }}</p>
                              </div>
                              <div class="flex gap-1">
                                <button
                                  @click.stop="startEditingNote(note)"
                                  class="p-1 text-xs text-neutral-60 rounded hover:bg-black/10 transition-colors"
                                  title="Edit note"
                                >
                                  <HeroIcons.PencilIcon class="w-4 h-4" />
                                </button>
                                <button
                                  @click.stop="deleteNote(note)"
                                  class="p-1 text-xs text-neutral-60 rounded hover:bg-black/10 hover:text-red-400 transition-colors"
                                  title="Delete note"
                                >
                                  <HeroIcons.TrashIcon class="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div v-else class="space-y-2">
                            <textarea
                              v-model="editingNoteText"
                              class="w-full p-2 text-sm border rounded-md resize-none bg-white text-black"
                              rows="3"
                              placeholder="Edit your note..."
                            ></textarea>
                            <div class="flex gap-2">
                              <button
                                @click="saveEditedNote"
                                class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                @click="cancelEditingNote"
                                class="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-center text-neutral-60 py-8">
                  <p class="text-sm">No verse notes for {{ currentBookId }} yet</p>
                  <p class="text-xs mt-1">Click on a verse to add your first note</p>
                </div>
              </div>

              <!-- Chapter Level Notes -->
              <div v-if="activeStudyLevel === 'chapter'">
                <div v-if="chapterNotes.length > 0" class="flex flex-col gap-2 rounded-md p-2">
                  <div class="text-sm text-neutral-60 mb-2">
                    {{ chapterNotes.length }} chapter note{{
                      chapterNotes.length !== 1 ? 's' : ''
                    }}
                    for {{ currentBookId }}
                  </div>
                  <ul class="flex flex-col gap-2">
                    <li
                      v-for="note in chapterNotes"
                      :key="note.id"
                      class="bg-neutral-20 p-2 rounded-md cursor-pointer hover:bg-neutral-30 transition-colors"
                    >
                      <p class="font-bold text-sm">Chapter {{ note.chapter }}</p>
                      <p class="text-sm text-wrap mt-1">{{ note.text }}</p>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-center text-neutral-60 py-8">
                  <p class="text-sm">No chapter notes for {{ currentBookId }} yet</p>
                  <p class="text-xs mt-1">Add notes for the entire chapter below</p>
                </div>
              </div>

              <!-- Book Level Notes -->
              <div v-if="activeStudyLevel === 'book'">
                <div v-if="bookNotes.length > 0" class="flex flex-col gap-2 rounded-md p-2">
                  <div class="text-sm text-neutral-60 mb-2">
                    {{ bookNotes.length }} book note{{ bookNotes.length !== 1 ? 's' : '' }} for
                    {{ currentBookId }}
                  </div>
                  <ul class="flex flex-col gap-2">
                    <li
                      v-for="note in bookNotes"
                      :key="note.id"
                      class="bg-neutral-20 p-2 rounded-md cursor-pointer hover:bg-neutral-30 transition-colors"
                    >
                      <p class="font-bold text-sm">{{ note.book }}</p>
                      <p class="text-sm text-wrap mt-1">{{ note.text }}</p>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-center text-neutral-60 py-8">
                  <p class="text-sm">No book notes for {{ currentBookId }} yet</p>
                  <p class="text-xs mt-1">Add notes for the entire book below</p>
                </div>
              </div>
            </div>

            <!-- Add Note Section -->
            <div class="flex flex-col gap-2">
              <div class="flex flex-col">
                <label for="note-text">
                  New {{ activeStudyLevel }} Note
                  <span
                    v-if="activeStudyLevel === 'verse' && !activeVerse"
                    class="text-red-500 text-xs"
                    >(Select a verse first)</span
                  >
                </label>
                <textarea
                  name=""
                  id=""
                  class="w-full h-full p-2 bg-secondary-lt rounded-md resize-none"
                  v-model="tmpNote"
                  rows="4"
                  :disabled="activeStudyLevel === 'verse' && !activeVerse"
                  style="
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: pre-wrap;
                    max-width: 100%;
                    box-sizing: border-box;
                  "
                >
                </textarea>
              </div>
              <div class="flex gap-2">
                <button
                  @click="cancelNote"
                  class="flex-1 px-2 py-1 border border-secondary-dk text-secondary-dk hover:bg-secondary-dk hover:text-white rounded-md w-fit"
                >
                  Cancel
                </button>
                <button
                  @click="addNoteForLevel"
                  :disabled="activeStudyLevel === 'verse' && !activeVerse"
                  class="flex-1 px-2 py-1 border border-secondary-dk text-secondary-dk hover:bg-secondary-dk hover:text-white rounded-md w-fit disabled:opacity-50"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
          <div
            v-if="activeStudyTool === 'questions'"
            class="flex flex-col gap-2 h-full justify-between"
          >
            <div>
              <!-- Verse Level Questions -->
              <div v-if="activeStudyLevel === 'verse'">
                <div
                  v-if="filteredUserQuestions.length > 0"
                  class="flex flex-col gap-2 rounded-md p-2"
                >
                  <div class="text-sm text-neutral-60 mb-2">
                    {{ filteredUserQuestions.length }} verse question{{
                      filteredUserQuestions.length !== 1 ? 's' : ''
                    }}
                    for {{ currentBookId }}
                  </div>
                  <ul class="flex flex-col gap-2">
                    <li
                      v-for="group in groupedUserQuestions"
                      :key="`${group.chapter}_${group.verse}`"
                      class="bg-neutral-20 rounded-md p-2 transition-colors"
                      :class="{
                        'bg-secondary-lt shadow-md':
                          activeVerse &&
                          activeVerse.chapter === group.chapter &&
                          activeVerse.verse === group.verse,
                      }"
                    >
                      <div class="mb-2">
                        <p class="font-bold text-sm">
                          Chapter {{ group.chapter }}, Verse {{ group.verse }}
                        </p>
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="question in group.questions"
                          :key="question.id"
                          class="p-2 rounded hover:bg-black/5 transition-colors"
                        >
                          <div
                            v-if="editingQuestion !== question.id"
                            class="cursor-pointer"
                            @click="findActiveVerseFromQuestion(question)"
                          >
                            <div class="flex justify-between items-start">
                              <div class="flex-1">
                                <p class="text-sm mt-1">{{ question.text }}</p>
                              </div>
                              <div class="flex gap-1">
                                <button
                                  @click.stop="startEditingQuestion(question)"
                                  class="p-1 text-xs text-neutral-60 rounded hover:bg-black/10 transition-colors"
                                  title="Edit question"
                                >
                                  <HeroIcons.PencilIcon class="w-4 h-4" />
                                </button>
                                <button
                                  @click.stop="deleteQuestion(question)"
                                  class="p-1 text-xs text-neutral-60 rounded hover:bg-black/10 hover:text-red-400 transition-colors"
                                  title="Delete question"
                                >
                                  <HeroIcons.TrashIcon class="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div v-else class="space-y-2">
                            <textarea
                              v-model="editingQuestionText"
                              class="w-full p-2 text-sm border rounded-md resize-none bg-white text-black"
                              rows="3"
                              placeholder="Edit your question..."
                            ></textarea>
                            <div class="flex gap-2">
                              <button
                                @click="saveEditedQuestion"
                                class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                @click="cancelEditingQuestion"
                                class="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-center text-neutral-60 py-8">
                  <p class="text-sm">No verse questions for {{ currentBookId }} yet</p>
                  <p class="text-xs mt-1">Click on a verse to add your first question</p>
                </div>
              </div>

              <!-- Chapter Level Questions -->
              <div v-if="activeStudyLevel === 'chapter'">
                <div v-if="chapterQuestions.length > 0" class="flex flex-col gap-2 rounded-md p-2">
                  <div class="text-sm text-neutral-60 mb-2">
                    {{ chapterQuestions.length }} chapter question{{
                      chapterQuestions.length !== 1 ? 's' : ''
                    }}
                    for {{ currentBookId }}
                  </div>
                  <ul class="flex flex-col gap-2">
                    <li
                      v-for="question in chapterQuestions"
                      :key="question.id"
                      class="bg-neutral-20 rounded-md p-2 cursor-pointer hover:bg-neutral-30 transition-colors"
                    >
                      <p class="font-bold text-sm">Chapter {{ question.chapter }}</p>
                      <p class="text-sm mt-1">{{ question.text }}</p>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-center text-neutral-60 py-8">
                  <p class="text-sm">No chapter questions for {{ currentBookId }} yet</p>
                  <p class="text-xs mt-1">Add questions for the entire chapter below</p>
                </div>
              </div>

              <!-- Book Level Questions -->
              <div v-if="activeStudyLevel === 'book'">
                <div v-if="bookQuestions.length > 0" class="flex flex-col gap-2 rounded-md p-2">
                  <div class="text-sm text-neutral-60 mb-2">
                    {{ bookQuestions.length }} book question{{
                      bookQuestions.length !== 1 ? 's' : ''
                    }}
                    for {{ currentBookId }}
                  </div>
                  <ul class="flex flex-col gap-2">
                    <li
                      v-for="question in bookQuestions"
                      :key="question.id"
                      class="bg-neutral-20 rounded-md p-2 cursor-pointer hover:bg-neutral-30 transition-colors"
                    >
                      <p class="font-bold text-sm">{{ question.book }}</p>
                      <p class="text-sm mt-1">{{ question.text }}</p>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-center text-neutral-60 py-8">
                  <p class="text-sm">No book questions for {{ currentBookId }} yet</p>
                  <p class="text-xs mt-1">Add questions for the entire book below</p>
                </div>
              </div>
            </div>

            <!-- Add Question Section -->
            <div>
              <div>
                <h2 class="">Add {{ activeStudyLevel }} Question</h2>
                <textarea
                  name=""
                  id=""
                  class="w-full h-full p-2 bg-secondary-lt rounded-md resize-none"
                  v-model="tmpQuestion"
                  rows="4"
                  :disabled="activeStudyLevel === 'verse' && !activeVerse"
                  style="
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: pre-wrap;
                    max-width: 100%;
                    box-sizing: border-box;
                  "
                >
                </textarea>
              </div>
              <div class="flex gap-2">
                <button
                  @click="cancelQuestion"
                  class="flex-1 px-2 py-1 border border-secondary-dk text-secondary-dk hover:bg-secondary-dk hover:text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  @click="addQuestionForLevel"
                  :disabled="activeStudyLevel === 'verse' && !activeVerse"
                  class="flex-1 px-2 py-1 text-nowrap border border-secondary-dk text-secondary-dk hover:bg-secondary-dk hover:text-white rounded-md disabled:opacity-50"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Verse Comparison Modal -->
      <div
        v-if="showComparison"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="closeComparison"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          @click.stop
        >
          <div class="flex items-center justify-between p-4 border-b bg-neutral-10">
            <h3 class="text-lg font-semibold">Verse Comparison</h3>
            <button @click="closeComparison" class="text-gray-500 hover:text-gray-700 text-xl">
              ×
            </button>
          </div>

          <div class="p-4 flex flex-col bg-neutral-30 min-h-fit">
            <div v-if="isComparisonLoading" class="flex items-center justify-center flex-1">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span class="ml-2">Loading comparison...</span>
            </div>

            <div
              v-else-if="comparisonError"
              class="flex flex-col items-center justify-center flex-1 text-red-600"
            >
              <p>Error loading comparison: {{ comparisonError }}</p>
              <button
                @click="closeComparison"
                class="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>

            <div v-else-if="comparisonData" class="flex flex-col">
              <!-- Comparison Cards Container -->
              <div class="p-6">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto items-start"
                >
                  <!-- Original Version -->
                  <div class="border rounded-lg p-4 bg-white shadow-md">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-semibold text-primary">
                        {{ currentVersion?.name || 'Current Version' }}
                      </h4>
                      <span class="text-sm text-gray-500"
                        >{{ comparisonData.originalVerse.chapter }}:{{
                          comparisonData.originalVerse.verse
                        }}</span
                      >
                    </div>
                    <p class="text-gray-800">{{ comparisonData.originalVerse.text }}</p>
                  </div>

                  <!-- Comparison Version -->
                  <div class="border rounded-lg p-4 bg-white shadow-md">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-semibold text-secondary-dk">
                        {{ comparisonData.version.name }}
                      </h4>
                      <span class="text-sm text-gray-500"
                        >{{ comparisonData.chapter }}:{{ comparisonData.verse }}</span
                      >
                    </div>
                    <p class="text-gray-800">{{ comparisonData.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Version Selector Footer -->
          <div class="p-4 border-t bg-neutral-10">
            <div class="flex flex-col gap-3">
              <label class="text-sm font-medium text-gray-700"
                >Compare with different version:</label
              >

              <!-- Popular Versions (Top 5) -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="version in popularVersions"
                  :key="version.id"
                  @click="openComparison(comparisonData.originalVerse, version.id)"
                  class="px-3 py-1 text-xs border border-gray-300 rounded transition-all duration-200"
                  :class="{
                    'bg-primary text-white border-primary hover:bg-primary-dk hover:border-primary-dk hover:text-white':
                      comparisonData.version.id === version.id,
                    'text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-400':
                      comparisonData.version.id !== version.id,
                  }"
                >
                  {{ version.abbreviation }}
                </button>
              </div>

              <!-- Other Versions Dropdown -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-600">More versions:</span>
                  <input
                    v-model="versionSearchQuery"
                    type="text"
                    placeholder="Search..."
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div class="max-h-24 overflow-y-auto border border-gray-300 rounded-md">
                  <div
                    v-for="version in filteredComparisonVersions"
                    :key="version.id"
                    @click="openComparison(comparisonData.originalVerse, version.id)"
                    class="px-2 py-1 text-xs cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    :class="{
                      'bg-primary text-white hover:bg-primary-dk hover:text-white':
                        comparisonData.version.id === version.id,
                      'text-gray-700 hover:bg-gray-100': comparisonData.version.id !== version.id,
                    }"
                  >
                    {{ version.name }} ({{ version.abbreviation }})
                  </div>

                  <div
                    v-if="filteredComparisonVersions.length === 0"
                    class="px-2 py-1 text-xs text-gray-500 italic"
                  >
                    No versions found
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes/Questions Section -->
          <div v-if="comparisonData" class="p-4 border-t bg-neutral-10">
            <div class="flex gap-2 mb-3">
              <button
                class="px-3 py-1 text-sm rounded-md transition-colors"
                :class="{
                  'bg-primary text-white': comparisonActiveTab === 'notes',
                  'bg-gray-200 text-gray-700 hover:bg-gray-300': comparisonActiveTab !== 'notes',
                }"
                @click="comparisonActiveTab = 'notes'"
              >
                Notes
              </button>
              <button
                class="px-3 py-1 text-sm rounded-md transition-colors"
                :class="{
                  'bg-primary text-white': comparisonActiveTab === 'questions',
                  'bg-gray-200 text-gray-700 hover:bg-gray-300':
                    comparisonActiveTab !== 'questions',
                }"
                @click="comparisonActiveTab = 'questions'"
              >
                Questions
              </button>
            </div>

            <!-- Notes Tab -->
            <div v-if="comparisonActiveTab === 'notes'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Note for this verse:</label
                >
                <textarea
                  v-model="comparisonNote"
                  class="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows="3"
                  placeholder="Add your note here..."
                ></textarea>
              </div>
              <div class="flex gap-2">
                <button
                  @click="saveComparisonNote"
                  class="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dk transition-colors"
                >
                  Save Note
                </button>
                <button
                  @click="comparisonNote = ''"
                  class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <!-- Questions Tab -->
            <div v-if="comparisonActiveTab === 'questions'" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Question for this verse:</label
                >
                <textarea
                  v-model="comparisonQuestion"
                  class="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows="3"
                  placeholder="Add your question here..."
                ></textarea>
              </div>
              <div class="flex gap-2">
                <button
                  @click="saveComparisonQuestion"
                  class="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dk transition-colors"
                >
                  Save Question
                </button>
                <button
                  @click="comparisonQuestion = ''"
                  class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click="closeDeleteModal"
  >
    <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl" @click.stop>
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 bg-red-100 rounded-full">
          <HeroIcons.ExclamationTriangleIcon class="w-6 h-6 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">
          Delete {{ deleteType === 'note' ? 'Note' : 'Question' }}
        </h3>
      </div>

      <p class="text-gray-600 mb-6">
        Are you sure you want to delete this {{ deleteType }}? This action cannot be undone.
      </p>

      <div class="flex gap-3 justify-end">
        <button
          @click="closeDeleteModal"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Jesus speech highlighting */
.jesus-speaking {
  border-left: 4px solid #e74c3c;
  background-color: #fdf2f2;
}

.jesus-text {
  font-style: italic;
  color: #c0392b;
  font-weight: 500;
}

/* God speech highlighting */
.god-speaking {
  border-left: 4px solid #8e44ad;
  background-color: #f4f0f7;
}

.god-text {
  font-style: italic;
  color: #8e44ad;
  font-weight: 500;
}

/* Key person highlighting */
.person-highlighted {
  border-left: 4px solid #f39c12;
  background-color: #fef9e7;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.verse-number {
  font-weight: bold;
  margin-right: 8px;
  @apply text-secondary-dk;
}

.verse-text {
  line-height: 1.4;
}

/* Enhanced styling for better readability */
li {
  transition: all 0.2s ease;
  border-radius: 6px;
}

li:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Active verse styling */
li.bg-secondary {
  background-color: #3498db !important;
  color: white;
}

li.bg-secondary .verse-number {
  color: white;
}

li.bg-secondary .jesus-text {
  color: #ffeb3b;
  font-weight: 600;
}

li.bg-secondary .god-text {
  color: #ffeb3b;
  font-weight: 600;
}

/* Textarea word wrapping */
textarea {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
  box-sizing: border-box;
}

/* Chapter carousel transitions */
.chapter-slide-enter-active,
.chapter-slide-leave-active {
  transition: all 0.2s ease-in-out;
}

.chapter-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.chapter-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.chapter-slide-move {
  transition: transform 0.2s ease-in-out;
}
</style>
