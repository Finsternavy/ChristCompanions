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
const oldTestament = ref(booksList.filter((book) => book.testament === 'old'))
const newTestament = ref(booksList.filter((book) => book.testament === 'new'))
const currentBookId = computed(() => bibleStore.currentBookId)
const currentVersion = computed(() => bibleStore.currentVersion)
const currentBook = computed(() => {
  const allBooks = [...oldTestament.value, ...newTestament.value]
  return allBooks.find((book) => book.id === currentBookId.value)
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
</script>

<template>
  <div class="bg-white/60 rounded-xl shadow-lg p-2">
    <div class="flex flex-col h-full">
      <!-- Current Selection Display -->
      <div class="flex-shrink-0 mb-4 p-2 bg-gray-50 rounded-lg border">
        <div class="text-xs text-gray-600 mb-1">Current Selection:</div>
        <div class="text-sm font-semibold text-gray-800">
          {{ currentBook?.name || 'No book selected' }}
        </div>
        <div class="text-xs text-gray-600">
          {{ currentVersion?.name || 'No version selected' }}
        </div>
      </div>

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
          class="w-full text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              :class="{ 'rotate-180': !oldTestamentOpen }"
              class="w-3 h-3 transition-transform duration-200"
            />
          </button>

          <div
            v-if="oldTestamentOpen"
            class="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
              :class="{ 'rotate-180': !newTestamentOpen }"
              class="w-3 h-3 transition-transform duration-200"
            />
          </button>

          <div
            v-if="newTestamentOpen"
            class="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
