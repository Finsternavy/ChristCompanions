<script setup>
import { ref, computed } from 'vue'
import * as HeroIcons from '@heroicons/vue/24/outline'
import booksList from '../models/bibleStructure/booksList.json'
import bibleVersions from '../data/bibleVersions.json'
import { useBibleStore } from '@/stores/bibleStore'

const bibleStore = useBibleStore()

const isOpen = ref(true)
const searchQuery = ref('')
const oldTestamentOpen = ref(false)
const newTestamentOpen = ref(false)
const versionOpen = ref(false)
const keyPeopleOpen = ref(false)
const oldTestament = ref(booksList.filter((book) => book.testament === 'old'))
const newTestament = ref(booksList.filter((book) => book.testament === 'new'))
const currentBookId = computed(() => bibleStore.currentBookId)
const currentVersion = computed(() => bibleStore.currentVersion)
const currentBook = computed(() => {
  const allBooks = [...oldTestament.value, ...newTestament.value]
  return allBooks.find((book) => book.id === currentBookId.value)
})

// Auto-expand the testament that contains the current book
const shouldExpandOldTestament = computed(() => {
  return currentBook.value?.testament === 'old'
})

const shouldExpandNewTestament = computed(() => {
  return currentBook.value?.testament === 'new'
})

// Key people functionality
const highlightedPerson = ref(null)
const highlightedVerses = ref([])
const personVerses = ref([])
const openChapters = ref(new Set())

// Book summary - try multiple data sources
const bookSummary = computed(() => {
  if (currentBookId.value) {
    // Try the store method first, but merge with bookData for keyCharacters
    const storeSummary = bibleStore.getBookSummary(currentBookId.value)
    const bookData = bibleStore.bookData

    if (storeSummary && bookData?.summary) {
      // Merge store summary with bookData keyCharacters
      return {
        ...storeSummary,
        keyCharacters: bookData.summary.keyCharacters || [],
      }
    }

    // Fallback to bookData if store method doesn't work
    if (bookData?.summary) {
      return {
        summary: bookData.summary.long || bookData.summary.short,
        keyCharacters: bookData.summary.keyCharacters || [],
      }
    }
  }
  return null
})
const filteredOldTestament = computed(() =>
  oldTestament.value.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

const filteredNewTestament = computed(() =>
  newTestament.value.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

// Auto-expand sections when searching
const handleSearch = () => {
  if (searchQuery.value.length > 0) {
    oldTestamentOpen.value = true
    newTestamentOpen.value = true
  }
}

const selectBook = async (book) => {
  // Call the store's setBookData function with the book object
  await bibleStore.setBookData(book)
}

const selectVersion = async (version) => {
  await bibleStore.setBibleVersion(version)
}

// Key people highlighting functions
const highlightPerson = (personName) => {
  // If clicking on the same person, clear the selection
  if (highlightedPerson.value === personName) {
    clearHighlighting()
    return
  }

  highlightedPerson.value = personName
  highlightedVerses.value = []
  personVerses.value = []

  // Find all verses that mention this person across all chapters in the current book
  const compiledData = bibleStore.compiledData
  if (compiledData) {
    compiledData.forEach((chapter) => {
      if (chapter.verses) {
        chapter.verses.forEach((verse) => {
          if (verse.text && containsPersonName(verse.text, personName)) {
            highlightedVerses.value.push(verse.id)
            // Store verse info for the person verses list
            personVerses.value.push({
              ...verse,
              chapterNumber: chapter.number,
              bookName: currentBookId.value,
            })
          }
        })
      }
    })
  }
}

// Helper function to check if a verse text contains a person's name
const containsPersonName = (text, personName) => {
  const lowerText = text.toLowerCase()
  const lowerPersonName = personName.toLowerCase()

  // Create a regex that matches the person's name as a whole word
  const nameRegex = new RegExp(
    `\\b${lowerPersonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
    'i',
  )

  // Also check for common variations and possessive forms
  const variations = [
    lowerPersonName,
    lowerPersonName + "'s", // possessive
    lowerPersonName + 's', // plural
    lowerPersonName + "'", // possessive without s
  ]

  // Check if any variation matches as a whole word
  return variations.some((variation) => {
    const variationRegex = new RegExp(
      `\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    )
    return variationRegex.test(lowerText)
  })
}

const clearHighlighting = () => {
  highlightedPerson.value = null
  highlightedVerses.value = []
  personVerses.value = []
  openChapters.value.clear()
}

// Group verses by chapter
const versesByChapter = computed(() => {
  if (!personVerses.value.length) return []

  const grouped = personVerses.value.reduce((acc, verse) => {
    const chapter = verse.chapterNumber
    if (!acc[chapter]) {
      acc[chapter] = []
    }
    acc[chapter].push(verse)
    return acc
  }, {})

  // Convert to array and sort by chapter number
  return Object.entries(grouped)
    .map(([chapter, verses]) => ({
      chapter: parseInt(chapter),
      verses: verses.sort((a, b) => a.verse - b.verse),
    }))
    .sort((a, b) => a.chapter - b.chapter)
})

// Toggle chapter accordion
const toggleChapter = (chapter) => {
  if (openChapters.value.has(chapter)) {
    openChapters.value.delete(chapter)
  } else {
    openChapters.value.add(chapter)
  }
}

// Capitalize book name (convert from lowercase ID to proper case)
const capitalizeBookName = (bookId) => {
  if (!bookId) return ''

  // Convert from ID format (e.g., 'matthew') to proper case (e.g., 'Matthew')
  return bookId
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Navigate to a specific verse
const navigateToVerse = (verse) => {
  // Find the chapter in compiled data
  const compiledData = bibleStore.compiledData
  const chapter = compiledData?.find((c) => c.number === verse.chapterNumber)
  if (chapter) {
    // Set the active chapter
    bibleStore.setActiveChapter(chapter)
    // Find and set the specific verse
    const targetVerse = chapter.verses.find((v) => v.verse === verse.verse)
    if (targetVerse) {
      bibleStore.setActiveVerse(targetVerse)

      // Scroll to the verse after a short delay to ensure DOM is updated
      setTimeout(() => {
        const verseElement = document.querySelector(`[data-verse-id="${targetVerse.id}"]`)
        if (verseElement) {
          verseElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }, 100)
    }
  }
}
</script>

<template>
  <div class="bg-white/60 rounded-xl shadow-lg p-2 w-80 flex-shrink-0">
    <div class="flex flex-col h-full">
      <!-- Bible Version Selector -->
      <div class="flex-shrink-0 mb-2">
        <p class="text-sm font-bold mb-2">Bible Version</p>
        <button
          @click="versionOpen = !versionOpen"
          class="flex gap-2 items-center justify-between w-full text-xs font-semibold text-gray-600 mb-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
        >
          <span class="text-nowrap">{{ currentVersion?.name || 'Select Version' }}</span>
          <HeroIcons.ChevronDownIcon
            :class="{ 'rotate-180': !versionOpen }"
            class="w-3 h-3 transition-transform duration-200"
          />
        </button>

        <div
          v-if="versionOpen"
          class="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-2"
        >
          <ul class="space-y-1">
            <li
              v-for="version in bibleVersions"
              :key="version.id"
              class="text-xs hover:bg-gray-100 rounded px-2 py-1 cursor-pointer transition-colors"
              :class="{ 'bg-secondary text-black': currentVersion?.id === version.id }"
              @click="selectVersion(version)"
            >
              <div class="font-medium">{{ version.name }}</div>
              <div class="text-gray-500">{{ version.abbreviation }}</div>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex-shrink-0 mb-2">
        <p class="text-sm font-bold mb-2">Books</p>
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Search books..."
          class="w-full text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
        />
      </div>

      <div
        class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <!-- Old Testament Section -->
        <div class="mb-4">
          <button
            @click="oldTestamentOpen = !oldTestamentOpen"
            class="flex gap-2 items-center justify-between w-full text-xs font-semibold text-gray-600 mb-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
          >
            <span class="text-nowrap">Old Testament ({{ filteredOldTestament.length }})</span>
            <HeroIcons.ChevronDownIcon
              :class="{ 'rotate-180': !(oldTestamentOpen || shouldExpandOldTestament) }"
              class="w-3 h-3 transition-transform duration-200"
            />
          </button>

          <div
            v-if="oldTestamentOpen || shouldExpandOldTestament"
            class="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-black/5 rounded-md p-2"
          >
            <ul class="space-y-1">
              <li
                v-for="book in filteredOldTestament"
                :key="book.id"
                class="text-sm hover:bg-gray-100 rounded px-2 py-1 cursor-pointer transition-colors"
                :class="{ 'bg-secondary text-black': currentBookId === book.id }"
                @click="selectBook(book)"
              >
                {{ book.name }}
              </li>
            </ul>
            <div
              v-if="filteredOldTestament.length === 0"
              class="text-xs text-gray-500 italic px-2 py-1"
            >
              No books found
            </div>
          </div>
        </div>

        <!-- New Testament Section -->
        <div>
          <button
            @click="newTestamentOpen = !newTestamentOpen"
            class="flex gap-2 items-center justify-between w-full text-xs font-semibold text-gray-600 mb-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
          >
            <span class="text-nowrap">New Testament ({{ filteredNewTestament.length }})</span>
            <HeroIcons.ChevronDownIcon
              :class="{ 'rotate-180': !(newTestamentOpen || shouldExpandNewTestament) }"
              class="w-3 h-3 transition-transform duration-200"
            />
          </button>

          <div
            v-if="newTestamentOpen || shouldExpandNewTestament"
            class="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-black/5 rounded-md p-2"
          >
            <ul class="space-y-1">
              <li
                v-for="book in filteredNewTestament"
                :key="book.id"
                class="text-sm hover:bg-gray-100 rounded px-2 py-1 cursor-pointer transition-colors"
                :class="{ 'bg-secondary text-black': currentBookId === book.id }"
                @click="selectBook(book)"
              >
                {{ book.name }}
              </li>
            </ul>
            <div
              v-if="filteredNewTestament.length === 0"
              class="text-xs text-gray-500 italic px-2 py-1"
            >
              No books found
            </div>
          </div>
        </div>

        <!-- Key People Section -->
        <div class="mb-4">
          <button
            @click="keyPeopleOpen = !keyPeopleOpen"
            class="flex gap-2 items-center justify-between w-full text-xs font-semibold text-gray-600 mb-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
          >
            <span class="text-nowrap">
              Key People ({{ bookSummary?.keyCharacters?.length || 0 }})
            </span>
            <HeroIcons.ChevronDownIcon
              :class="{ 'rotate-180': !keyPeopleOpen }"
              class="w-3 h-3 transition-transform duration-200"
            />
          </button>

          <!-- Clear button above scrollable list -->
          <button
            v-if="keyPeopleOpen && highlightedPerson"
            @click="clearHighlighting"
            class="w-full text-left text-xs bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600 transition-colors mb-2"
          >
            Clear Selection
          </button>

          <div
            v-if="keyPeopleOpen && bookSummary?.keyCharacters"
            class="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-black/5 rounded-md p-2"
          >
            <div class="space-y-1">
              <button
                v-for="character in bookSummary.keyCharacters"
                :key="character"
                class="w-full text-left text-xs rounded px-2 py-1 cursor-pointer transition-colors"
                :class="{
                  'bg-secondary text-black': highlightedPerson === character,
                  'text-gray-700 hover:bg-gray-100': highlightedPerson !== character,
                }"
                @click="highlightPerson(character)"
              >
                {{ character }}
              </button>
            </div>
          </div>

          <div
            v-if="keyPeopleOpen && !bookSummary?.keyCharacters"
            class="text-xs text-gray-500 italic px-2 py-1"
          >
            No key people data available
          </div>
        </div>

        <!-- Person Verses Section -->
        <div v-if="highlightedPerson && personVerses.length > 0" class="mb-4">
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold text-gray-800">{{ highlightedPerson }} Verses</h3>
              <span class="text-xs text-gray-600"
                >{{ personVerses.length }} verse{{ personVerses.length !== 1 ? 's' : '' }}</span
              >
            </div>

            <div class="max-h-64 overflow-y-auto space-y-2">
              <div
                v-for="chapterGroup in versesByChapter"
                :key="chapterGroup.chapter"
                class="border border-gray-200 rounded"
              >
                <!-- Chapter Header -->
                <button
                  @click="toggleChapter(chapterGroup.chapter)"
                  class="w-full flex items-center justify-between px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-semibold text-gray-700"
                >
                  <span>Chapter {{ chapterGroup.chapter }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500"
                      >{{ chapterGroup.verses.length }} verse{{
                        chapterGroup.verses.length !== 1 ? 's' : ''
                      }}</span
                    >
                    <HeroIcons.ChevronDownIcon
                      :class="{ 'rotate-180': openChapters.has(chapterGroup.chapter) }"
                      class="w-3 h-3 transition-transform duration-200"
                    />
                  </div>
                </button>

                <!-- Chapter Verses -->
                <div v-if="openChapters.has(chapterGroup.chapter)" class="space-y-1 p-2 bg-white">
                  <div
                    v-for="verse in chapterGroup.verses"
                    :key="`${verse.chapterNumber}-${verse.verse}`"
                    @click="navigateToVerse(verse)"
                    class="px-2 py-1 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100 hover:border-primary transition-all duration-200 border border-gray-100"
                  >
                    <span class="font-semibold text-primary"
                      >{{ capitalizeBookName(verse.bookName) }} {{ verse.chapterNumber }}:{{
                        verse.verse
                      }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
/* .scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: rgb(209 213 219);
  border-radius: 0.25rem;
}

.scrollbar-track-gray-100::-webkit-scrollbar-track {
  background-color: rgb(243 244 246);
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
} */
</style>
