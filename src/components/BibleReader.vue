<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useBibleStore } from '@/stores/bibleStore'
import * as HeroIcons from '@heroicons/vue/24/solid'

// Props to receive data from parent
const props = defineProps({
  openComparison: {
    type: Function,
    required: true,
  },
})

const bibleStore = useBibleStore()

// Store getters
const bookData = computed(() => bibleStore.bookData)
const compiledData = computed(() => bibleStore.compiledData)
const activeChapter = computed(() => bibleStore.activeChapter)
const activeVerse = computed(() => bibleStore.activeVerse)

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

// Chapter carousel state
const chapterCarouselStart = ref(0)
const chaptersPerView = 5

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

// Watch for active chapter changes to center carousel
watch(activeChapter, () => {
  centerOnActiveChapter()
  // Scroll to top of verses container when chapter changes
  nextTick(() => {
    if (versesContainer.value) {
      versesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
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
    return
  }

  bibleStore.setActiveVerse(verse)
  // Clear the flag when manually selecting a verse
  activeVerseSetDuringReading.value = false
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
    startReadingFromVerse(activeVerse.value)
  } else {
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
    } else {
      // If the selected verse doesn't exist in current chapter, fall back to lastReadVerse
      if (lastReadVerse.value && lastReadVerse.value.chapter === activeChapter.value.number) {
        const lastReadIndex = activeChapter.value.verses.findIndex(
          (v) => v.id === lastReadVerse.value.id,
        )
        if (lastReadIndex !== -1) {
          startIndex = lastReadIndex
        } else {
          startIndex = 0
        }
      } else {
        startIndex = 0
      }
    }
  } else {
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
      readingTimeout.value = setTimeout(() => {
        if (isReading.value) {
          const nextChapter = compiledData.value[currentChapterIndex + 1]
          setActiveChapter(nextChapter, true) // Pass isResuming = true to preserve lastReadVerse

          // Set the first verse of the next chapter as the activeVerse
          if (nextChapter.verses.length > 0) {
            bibleStore.setActiveVerse(nextChapter.verses[0])
            activeVerseSetDuringReading.value = true
          }

          // Queue all verses in the next chapter
          speechQueue.value = [...nextChapter.verses]
          readNextVerse()
        }
      }, 2000)
    } else {
      // End of book reached
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

const stopReading = () => {
  // Cancel any ongoing speech
  speechSynthesis.cancel()

  // Clear any pending timeouts
  if (readingTimeout.value) {
    clearTimeout(readingTimeout.value)
    readingTimeout.value = null
  }

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

onMounted(() => {
  // Load available voices
  loadVoices()

  // Listen for voice changes
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = loadVoices
  }
})
</script>

<template>
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
          <TransitionGroup name="chapter-slide" tag="div" class="flex justify-between gap-1 w-full">
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
              'bg-green-100 border-l-4 border-green-500': currentReadingVerse?.id === verse.id,
              'bg-secondary': activeVerse?.id === verse.id && currentReadingVerse?.id !== verse.id,
              'jesus-speaking': verse.speaker === 'Jesus' && currentReadingVerse?.id !== verse.id,
              'god-speaking': verse.speaker === 'God' && currentReadingVerse?.id !== verse.id,
            }"
            @click="setActiveVerse(verse)"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <span class="verse-number">{{ verse.verse }}</span>
                <span class="ml-2"></span>
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
</style>
