<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ChapterViewer from '@/components/ChapterViewer.vue'
import { useBibleStore } from '@/stores/bibleStore'
import { useStudyGroupsStore } from '@/stores/studyGroupsStore'
import * as HeroIcons from '@heroicons/vue/24/solid'
// use uuidv4
import { v4 as uuidv4 } from 'uuid'
import SideNav from '@/components/SideNav.vue'
import BibleReader from '@/components/BibleReader.vue'
import BibleSidebar from '@/components/BibleSidebar.vue'

const bibleStore = useBibleStore()
const studyGroupsStore = useStudyGroupsStore()
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

const isLoading = computed(() => bibleStore.isLoading)

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

// Watch for book changes to reset active verse
watch(currentBookId, (newBookId, oldBookId) => {
  if (newBookId !== oldBookId) {
    bibleStore.setActiveVerse(null)
  }
})

const setActiveVerse = (verse) => {
  if (activeVerse.value?.id === verse.id) {
    bibleStore.setActiveVerse(null)
    return
  }

  bibleStore.setActiveVerse(verse)
}

const findActiveVerse = (note) => {
  console.log('🔍 findActiveVerse called with:', note)
  bibleStore.navigateToVerseFromNote(note)

  // Scroll to the verse after navigation
  setTimeout(() => {
    const verseElement = document.querySelector(`[data-verse-id="${note.id}"]`)
    if (verseElement) {
      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, 100)
}

const findActiveVerseFromQuestion = (question) => {
  console.log('🔍 findActiveVerseFromQuestion called with:', question)
  bibleStore.navigateToVerseFromNote(question)

  // Scroll to the verse after navigation
  setTimeout(() => {
    const verseElement = document.querySelector(`[data-verse-id="${question.id}"]`)
    if (verseElement) {
      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, 100)
}

// Navigate to a specific verse
const navigateToVerse = (verse) => {
  // Find the chapter in compiled data
  const chapter = compiledData.value?.find((c) => c.number === verse.chapterNumber)
  if (chapter) {
    bibleStore.setActiveChapter(chapter)
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
        <!-- Use the new BibleReader component -->
        <BibleReader :openComparison="openComparison" />
        <BibleSidebar />
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

