<script setup>
import { ref, computed, watch } from 'vue'
import { useBibleStore } from '@/stores/bibleStore'
import { useStudyGroupsStore } from '@/stores/studyGroupsStore'
import { v4 as uuidv4 } from 'uuid'
import * as HeroIcons from '@heroicons/vue/24/solid'

const bibleStore = useBibleStore()
const studyGroupsStore = useStudyGroupsStore()

// Current user identifier
const currentUserEmail = 'chris.finster@inclusivemedium.com'

// Helper function to check if a note/question belongs to the current user
const isCurrentUserNote = (note) => {
  // If there's no userEmail, it's the current user's note
  return !note.userEmail || note.userEmail === currentUserEmail
}

const isCurrentUserQuestion = (question) => {
  // If there's no userEmail, it's the current user's question
  return !question.userEmail || question.userEmail === currentUserEmail
}

// Store getters
const bookData = computed(() => bibleStore.bookData)
const activeChapter = computed(() => bibleStore.activeChapter)
const currentBookId = computed(() => bibleStore.currentBookId)
const activeVerse = computed(() => bibleStore.activeVerse)
const activeNote = computed(() => bibleStore.activeNote)
const userNotes = computed(() => bibleStore.userNotes)
const userQuestions = computed(() => bibleStore.userQuestions)

// Book summary
const bookSummary = computed(() => {
  if (currentBookId.value) {
    return bibleStore.getBookSummary(currentBookId.value)
  }
  return null
})

// Sidebar state
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

// Filtered notes and questions
const filteredUserNotes = computed(() => {
  const allNotes = bibleStore.getFilteredNotes()
  // Filter by current book
  const bookNotes = allNotes.filter((note) => note.book === currentBookId.value)

  // If an active verse is selected, show only notes for that verse
  if (activeVerse.value) {
    return bookNotes.filter(
      (note) =>
        note.chapter === activeVerse.value.chapter && note.verse === activeVerse.value.verse,
    )
  }

  // Otherwise show all verse-level notes for the book, sorted by chapter and verse
  return bookNotes.sort((a, b) => {
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
  // Filter by current book
  const bookQuestions = allQuestions.filter((question) => question.book === currentBookId.value)

  // If an active verse is selected, show only questions for that verse
  if (activeVerse.value) {
    return bookQuestions.filter(
      (question) =>
        question.chapter === activeVerse.value.chapter &&
        question.verse === activeVerse.value.verse,
    )
  }

  // Otherwise show all verse-level questions for the book, sorted by chapter and verse
  return bookQuestions.sort((a, b) => {
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

  return Object.values(grouped)
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

  return Object.values(grouped)
})

// Chapter level notes and questions
const chapterNotes = computed(() => {
  if (activeStudyLevel.value === 'chapter') {
    // Show user's own chapter-level notes for the current book
    return bibleStore.chapterNotes.filter(
      (note) => note.book === currentBookId.value && note.chapter === activeChapter.value?.number,
    )
  }
  return []
})

const chapterQuestions = computed(() => {
  if (activeStudyLevel.value === 'chapter') {
    // Show user's own chapter-level questions for the current book
    return bibleStore.chapterQuestions.filter(
      (question) =>
        question.book === currentBookId.value && question.chapter === activeChapter.value?.number,
    )
  }
  return []
})

// Book level notes and questions
const bookNotes = computed(() => {
  if (activeStudyLevel.value === 'book') {
    // Show user's own book-level notes for the current book
    return bibleStore.bookNotes.filter((note) => note.book === currentBookId.value)
  }
  return []
})

const bookQuestions = computed(() => {
  if (activeStudyLevel.value === 'book') {
    // Show user's own book-level questions for the current book
    return bibleStore.bookQuestions.filter((question) => question.book === currentBookId.value)
  }
  return []
})

// Study groups - other users' notes and questions
const otherUsersNotes = computed(() => {
  if (!studyGroupsStore.showOtherUsersContent) return []

  if (activeStudyLevel.value === 'verse') {
    // If an active verse is selected, show only notes for that verse
    if (activeVerse.value) {
      return studyGroupsStore
        .getOtherUsersNotes(currentBookId.value)
        .filter(
          (note) =>
            note.verse !== undefined &&
            note.verse !== null &&
            note.chapter === activeVerse.value.chapter &&
            note.verse === activeVerse.value.verse,
        )
    }
    // Otherwise show all verse-level notes for the current book
    return studyGroupsStore
      .getOtherUsersNotes(currentBookId.value)
      .filter((note) => note.verse !== undefined && note.verse !== null)
      .sort((a, b) => {
        // First sort by chapter
        if (a.chapter !== b.chapter) {
          return a.chapter - b.chapter
        }
        // Then sort by verse
        return a.verse - b.verse
      })
  } else if (activeStudyLevel.value === 'chapter') {
    // Show all chapter-level notes for the current book
    return studyGroupsStore
      .getOtherUsersNotes(currentBookId.value)
      .filter(
        (note) =>
          note.chapter !== undefined &&
          note.chapter !== null &&
          (note.verse === undefined || note.verse === null),
      )
      .sort((a, b) => a.chapter - b.chapter)
  } else if (activeStudyLevel.value === 'book') {
    // Show all book-level notes for the current book
    return studyGroupsStore
      .getOtherUsersNotes(currentBookId.value)
      .filter((note) => note.chapter === undefined || note.chapter === null)
  }
  return []
})

const otherUsersQuestions = computed(() => {
  if (!studyGroupsStore.showOtherUsersContent) return []

  if (activeStudyLevel.value === 'verse') {
    // If an active verse is selected, show only questions for that verse
    if (activeVerse.value) {
      return studyGroupsStore
        .getOtherUsersQuestions(currentBookId.value)
        .filter(
          (question) =>
            question.verse !== undefined &&
            question.verse !== null &&
            question.chapter === activeVerse.value.chapter &&
            question.verse === activeVerse.value.verse,
        )
    }
    // Otherwise show all verse-level questions for the current book
    return studyGroupsStore
      .getOtherUsersQuestions(currentBookId.value)
      .filter((question) => question.verse !== undefined && question.verse !== null)
      .sort((a, b) => {
        // First sort by chapter
        if (a.chapter !== b.chapter) {
          return a.chapter - b.chapter
        }
        // Then sort by verse
        return a.verse - b.verse
      })
  } else if (activeStudyLevel.value === 'chapter') {
    // Show all chapter-level questions for the current book
    return studyGroupsStore
      .getOtherUsersQuestions(currentBookId.value)
      .filter(
        (question) =>
          question.chapter !== undefined &&
          question.chapter !== null &&
          (question.verse === undefined || question.verse === null),
      )
      .sort((a, b) => a.chapter - b.chapter)
  } else if (activeStudyLevel.value === 'book') {
    // Show all book-level questions for the current book
    return studyGroupsStore
      .getOtherUsersQuestions(currentBookId.value)
      .filter((question) => question.chapter === undefined || question.chapter === null)
  }
  return []
})

// Watch for book changes to reset active verse
watch(currentBookId, (newBookId, oldBookId) => {
  if (newBookId !== oldBookId) {
    bibleStore.setActiveVerse(null)
    tmpNote.value = ''
  }
})

const setActiveVerse = (verse) => {
  if (activeVerse.value?.id === verse.id) {
    bibleStore.setActiveVerse(null)
    tmpNote.value = ''
    return
  }

  bibleStore.setActiveVerse(verse)
  tmpNote.value = activeNote.value?.text || ''
  // Auto-switch to verse level when a verse is clicked
  activeStudyLevel.value = 'verse'
}

const findActiveVerse = (note) => {
  console.log('🔍 findActiveVerse called with:', note)
  bibleStore.navigateToVerseFromNote(note)
  tmpNote.value = activeNote.value?.text || ''

  // Scroll to the verse after navigation
  setTimeout(() => {
    // Find the verse element by verse number since we know the chapter and verse
    const verseNumber = note.verse
    if (verseNumber) {
      // Look for verse elements and find the one with matching verse number
      const allVerseElements = document.querySelectorAll('[data-verse-id]')
      for (const element of allVerseElements) {
        const verseText = element.querySelector('.verse-number')
        if (verseText && verseText.textContent.trim() === verseNumber.toString()) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          break
        }
      }
    }
  }, 200) // Increased timeout to ensure DOM is updated after navigation
}

const findActiveVerseFromQuestion = (question) => {
  console.log('🔍 findActiveVerseFromQuestion called with:', question)
  bibleStore.navigateToVerseFromNote(question)
  tmpQuestion.value = question.text || ''

  // Scroll to the verse after navigation
  setTimeout(() => {
    // Find the verse element by verse number since we know the chapter and verse
    const verseNumber = question.verse
    if (verseNumber) {
      // Look for verse elements and find the one with matching verse number
      const allVerseElements = document.querySelectorAll('[data-verse-id]')
      for (const element of allVerseElements) {
        const verseText = element.querySelector('.verse-number')
        if (verseText && verseText.textContent.trim() === verseNumber.toString()) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          break
        }
      }
    }
  }, 200) // Increased timeout to ensure DOM is updated after navigation
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

// Chapter note editing functions
const startEditingChapterNote = (note) => {
  editingNote.value = note.id
  editingNoteText.value = note.text || ''
}

const saveEditedChapterNote = () => {
  if (editingNote.value && editingNoteText.value.trim()) {
    const note = chapterNotes.value.find((n) => n.id === editingNote.value)
    if (note) {
      bibleStore.addOrUpdateChapterNote(note.book, note.chapter, editingNoteText.value, note.id)
    }
  }
  cancelEditingNote()
}

const deleteChapterNote = (note) => {
  itemToDelete.value = note
  deleteType.value = 'chapterNote'
  showDeleteModal.value = true
}

// Book note editing functions
const startEditingBookNote = (note) => {
  editingNote.value = note.id
  editingNoteText.value = note.text || ''
}

const saveEditedBookNote = () => {
  if (editingNote.value && editingNoteText.value.trim()) {
    const note = bookNotes.value.find((n) => n.id === editingNote.value)
    if (note) {
      bibleStore.addOrUpdateBookNote(note.book, editingNoteText.value, note.id)
    }
  }
  cancelEditingNote()
}

const deleteBookNote = (note) => {
  itemToDelete.value = note
  deleteType.value = 'bookNote'
  showDeleteModal.value = true
}

// Chapter question editing functions
const startEditingChapterQuestion = (question) => {
  editingQuestion.value = question.id
  editingQuestionText.value = question.text || ''
}

const saveEditedChapterQuestion = () => {
  if (editingQuestion.value && editingQuestionText.value.trim()) {
    const question = chapterQuestions.value.find((q) => q.id === editingQuestion.value)
    if (question) {
      bibleStore.addOrUpdateChapterQuestion(
        question.book,
        question.chapter,
        editingQuestionText.value,
        question.id,
      )
    }
  }
  cancelEditingQuestion()
}

const deleteChapterQuestion = (question) => {
  itemToDelete.value = question
  deleteType.value = 'chapterQuestion'
  showDeleteModal.value = true
}

// Book question editing functions
const startEditingBookQuestion = (question) => {
  editingQuestion.value = question.id
  editingQuestionText.value = question.text || ''
}

const saveEditedBookQuestion = () => {
  if (editingQuestion.value && editingQuestionText.value.trim()) {
    const question = bookQuestions.value.find((q) => q.id === editingQuestion.value)
    if (question) {
      bibleStore.addOrUpdateBookQuestion(question.book, editingQuestionText.value, question.id)
    }
  }
  cancelEditingQuestion()
}

const deleteBookQuestion = (question) => {
  itemToDelete.value = question
  deleteType.value = 'bookQuestion'
  showDeleteModal.value = true
}

// Modal functions
const confirmDelete = () => {
  if (deleteType.value === 'note' && itemToDelete.value) {
    bibleStore.deleteNote(itemToDelete.value.id)
  } else if (deleteType.value === 'question' && itemToDelete.value) {
    bibleStore.deleteQuestion(itemToDelete.value.id)
  } else if (deleteType.value === 'chapterNote' && itemToDelete.value) {
    bibleStore.deleteChapterNote(itemToDelete.value.id)
  } else if (deleteType.value === 'bookNote' && itemToDelete.value) {
    bibleStore.deleteBookNote(itemToDelete.value.id)
  } else if (deleteType.value === 'chapterQuestion' && itemToDelete.value) {
    bibleStore.deleteChapterQuestion(itemToDelete.value.id)
  } else if (deleteType.value === 'bookQuestion' && itemToDelete.value) {
    bibleStore.deleteBookQuestion(itemToDelete.value.id)
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
  deleteType.value = ''
}

const cancelNote = () => {
  tmpNote.value = ''
}

const addNote = () => {
  if (!activeVerse.value) {
    console.error('Cannot add verse note: no active verse selected')
    return
  }
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
  if (!activeVerse.value) {
    console.error('Cannot add verse question: no active verse selected')
    return
  }
  bibleStore.addOrUpdateQuestion(activeVerse.value, tmpQuestion.value, uuidv4())
  tmpQuestion.value = ''
}

// Chapter level note/question functions
const addChapterNote = () => {
  if (!currentBookId.value || !activeChapter.value?.number) {
    console.error('Cannot add chapter note: missing book or chapter data')
    return
  }
  bibleStore.addOrUpdateChapterNote(
    currentBookId.value,
    activeChapter.value.number,
    tmpNote.value,
    uuidv4(),
  )
  tmpNote.value = ''
}

const addChapterQuestion = () => {
  if (!currentBookId.value || !activeChapter.value?.number) {
    console.error('Cannot add chapter question: missing book or chapter data')
    return
  }
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
  if (!currentBookId.value) {
    console.error('Cannot add book note: missing book data')
    return
  }
  bibleStore.addOrUpdateBookNote(currentBookId.value, tmpNote.value, uuidv4())
  tmpNote.value = ''
}

const addBookQuestion = () => {
  if (!currentBookId.value) {
    console.error('Cannot add book question: missing book data')
    return
  }
  bibleStore.addOrUpdateBookQuestion(currentBookId.value, tmpQuestion.value, uuidv4())
  tmpQuestion.value = ''
}

// Dynamic add functions based on level
const addNoteForLevel = () => {
  if (activeStudyLevel.value === 'verse') {
    if (!activeVerse.value) {
      console.warn('Cannot add verse note: no active verse selected')
      return
    }
    addNote()
  } else if (activeStudyLevel.value === 'chapter') {
    addChapterNote()
  } else if (activeStudyLevel.value === 'book') {
    addBookNote()
  }
}

const addQuestionForLevel = () => {
  if (activeStudyLevel.value === 'verse') {
    if (!activeVerse.value) {
      console.warn('Cannot add verse question: no active verse selected')
      return
    }
    addQuestion()
  } else if (activeStudyLevel.value === 'chapter') {
    addChapterQuestion()
  } else if (activeStudyLevel.value === 'book') {
    addBookQuestion()
  }
}
</script>

<template>
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

    <!-- Study Groups Toggle -->
    <div class="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-md">
      <span class="text-xs text-gray-600">Show study group content</span>
      <button
        @click="studyGroupsStore.toggleOtherUsersContent()"
        class="relative inline-flex h-4 w-7 items-center rounded-full transition-colors"
        :class="{
          'bg-primary': studyGroupsStore.showOtherUsersContent,
          'bg-gray-300': !studyGroupsStore.showOtherUsersContent,
        }"
      >
        <span
          class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
          :class="{
            'translate-x-3.5': studyGroupsStore.showOtherUsersContent,
            'translate-x-0.5': !studyGroupsStore.showOtherUsersContent,
          }"
        />
      </button>
    </div>

    <!-- Notes Section -->
    <div
      v-if="activeStudyTool === 'notes'"
      class="min-w-0 h-full justify-between flex flex-col overflow-hidden"
    >
      <!-- Notes Count Header -->
      <div v-if="activeStudyLevel === 'verse'" class="text-sm text-neutral-60 mb-2 px-2">
        <div v-if="filteredUserNotes.length > 0">
          {{ filteredUserNotes.length }} verse note{{
            filteredUserNotes.length !== 1 ? 's' : ''
          }}
          for {{ currentBookId }}
        </div>
      </div>
      <div v-if="activeStudyLevel === 'chapter'" class="text-sm text-neutral-60 mb-2 px-2">
        <div v-if="chapterNotes.length > 0">
          {{ chapterNotes.length }} chapter note{{ chapterNotes.length !== 1 ? 's' : '' }} for
          {{ currentBookId }}
        </div>
      </div>
      <div v-if="activeStudyLevel === 'book'" class="text-sm text-neutral-60 mb-2 px-2">
        <div v-if="bookNotes.length > 0">
          {{ bookNotes.length }} book note{{ bookNotes.length !== 1 ? 's' : '' }} for
          {{ currentBookId }}
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- Verse Level Notes -->
        <div v-if="activeStudyLevel === 'verse'">
          <div v-if="filteredUserNotes.length > 0" class="flex flex-col gap-2 rounded-md p-2">
            <ul class="flex flex-col gap-2">
              <li
                v-for="group in groupedUserNotes"
                :key="`${group.chapter}_${group.verse}`"
                class="bg-neutral-20 p-2 rounded-md transition-colors"
                :class="{
                  'bg-secondary':
                    activeVerse?.chapter === group.chapter && activeVerse?.verse === group.verse,
                }"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-neutral-70 capitalize">
                    {{ currentBookId }} {{ group.chapter }}:{{ group.verse }}
                  </span>
                  <button
                    @click="findActiveVerse(group.notes[0])"
                    class="text-xs text-secondary-dk hover:bg-black/5 p-1 transition-colors"
                  >
                    Go to verse
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="note in group.notes"
                    :key="note.id"
                    class="p-2 rounded-md border-l-2 border-secondary"
                  >
                    <div v-if="editingNote === note.id" class="space-y-2">
                      <textarea
                        v-model="editingNoteText"
                        class="w-full p-2 text-sm border rounded-md resize-none"
                        rows="3"
                        placeholder="Edit your note..."
                      ></textarea>
                      <div class="flex gap-2">
                        <button
                          @click="saveEditedNote"
                          class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk transition-colors"
                        >
                          Save
                        </button>
                        <button
                          @click="cancelEditingNote"
                          class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div v-else>
                      <p class="text-sm text-gray-800">{{ note.text }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-gray-500">{{ note.createdAt }}</span>
                        <div v-if="isCurrentUserNote(note)" class="flex gap-1">
                          <button
                            @click="startEditingNote(note)"
                            class="text-xs hover:text-secondary-dk transition-colors"
                            title="Edit note"
                          >
                            <HeroIcons.PencilIcon class="w-5 h-5" />
                          </button>
                          <button
                            @click="deleteNote(note)"
                            class="text-xs hover:text-red-700 transition-colors"
                            title="Delete note"
                          >
                            <HeroIcons.TrashIcon class="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">No notes yet</p>
            <p class="text-xs text-gray-400 mt-1">Click on a verse to add a note</p>
          </div>

          <!-- Study Group Notes -->
          <div v-if="otherUsersNotes.length > 0" class="mt-4">
            <div class="text-sm text-neutral-60 mb-2 px-2">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Study Group Notes ({{ otherUsersNotes.length }})
              </div>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-2 bg-orange-50">
              <div
                v-for="note in otherUsersNotes"
                :key="note.id"
                class="p-3 rounded-md border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
                :class="{
                  'bg-secondary-lt shadow-md':
                    activeVerse &&
                    activeVerse.chapter === note.chapter &&
                    activeVerse.verse === note.verse,
                  'bg-white': !(
                    activeVerse &&
                    activeVerse.chapter === note.chapter &&
                    activeVerse.verse === note.verse
                  ),
                }"
                @click="findActiveVerse(note)"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ note.userName }}</span>
                  <span class="text-xs text-gray-500">
                    <span v-if="note.verse"
                      >Chapter {{ note.chapter }}, Verse {{ note.verse }}</span
                    >
                    <span v-else-if="note.chapter">Chapter {{ note.chapter }}</span>
                    <span v-else>Book level</span>
                  </span>
                </div>
                <p class="text-sm text-gray-700">{{ note.text }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(note.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter Level Notes -->
        <div v-if="activeStudyLevel === 'chapter'">
          <div v-if="chapterNotes.length > 0" class="flex flex-col gap-2 rounded-md p-2">
            <ul class="flex flex-col gap-2">
              <li
                v-for="note in chapterNotes"
                :key="note.id"
                class="bg-neutral-20 p-2 rounded-md transition-colors"
              >
                <div v-if="editingNote === note.id" class="space-y-2">
                  <textarea
                    v-model="editingNoteText"
                    class="w-full p-2 text-sm border rounded-md resize-none"
                    rows="3"
                    placeholder="Edit your note..."
                  ></textarea>
                  <div class="flex gap-2">
                    <button
                      @click="saveEditedChapterNote"
                      class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk transition-colors"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditingNote"
                      class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div v-else>
                  <p class="text-sm text-gray-800">{{ note.text }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ note.createdAt }}</span>
                    <div v-if="isCurrentUserNote(note)" class="flex gap-1">
                      <button
                        @click="startEditingChapterNote(note)"
                        class="text-xs hover:text-secondary-dk transition-colors"
                        title="Edit note"
                      >
                        <HeroIcons.PencilIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="deleteChapterNote(note)"
                        class="text-xs hover:text-red-700 transition-colors"
                        title="Delete note"
                      >
                        <HeroIcons.TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">No chapter notes yet</p>
            <p class="text-xs text-gray-400 mt-1">Add notes for the entire chapter</p>
          </div>

          <!-- Study Group Chapter Notes -->
          <div v-if="otherUsersNotes.length > 0" class="mt-4">
            <div class="text-sm text-neutral-60 mb-2 px-2">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Study Group Chapter Notes ({{ otherUsersNotes.length }})
              </div>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-2 bg-orange-50">
              <div
                v-for="note in otherUsersNotes"
                :key="note.id"
                class="p-3 rounded-md border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
                @click="findActiveVerse(note)"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ note.userName }}</span>
                  <span class="text-xs text-gray-500"> Chapter {{ note.chapter }} </span>
                </div>
                <p class="text-sm text-gray-700">{{ note.text }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(note.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Book Level Notes -->
        <div v-if="activeStudyLevel === 'book'">
          <div v-if="bookNotes.length > 0" class="flex flex-col gap-2 rounded-md p-2">
            <ul class="flex flex-col gap-2">
              <li
                v-for="note in bookNotes"
                :key="note.id"
                class="bg-neutral-20 p-2 rounded-md transition-colors"
              >
                <div v-if="editingNote === note.id" class="space-y-2">
                  <textarea
                    v-model="editingNoteText"
                    class="w-full p-2 text-sm border rounded-md resize-none"
                    rows="3"
                    placeholder="Edit your note..."
                  ></textarea>
                  <div class="flex gap-2">
                    <button
                      @click="saveEditedBookNote"
                      class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk transition-colors"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditingNote"
                      class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div v-else>
                  <p class="text-sm text-gray-800">{{ note.text }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ note.createdAt }}</span>
                    <div v-if="isCurrentUserNote(note)" class="flex gap-1">
                      <button
                        @click="startEditingBookNote(note)"
                        class="text-xs hover:text-secondary-dk transition-colors"
                        title="Edit note"
                      >
                        <HeroIcons.PencilIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="deleteBookNote(note)"
                        class="text-xs hover:text-red-700 transition-colors"
                        title="Delete note"
                      >
                        <HeroIcons.TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">No book notes yet</p>
            <p class="text-xs text-gray-400 mt-1">Add notes for the entire book</p>
          </div>

          <!-- Study Group Book Notes -->
          <div v-if="otherUsersNotes.length > 0" class="mt-4">
            <div class="text-sm text-neutral-60 mb-2 px-2">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Study Group Book Notes ({{ otherUsersNotes.length }})
              </div>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-2 bg-orange-50">
              <div
                v-for="note in otherUsersNotes"
                :key="note.id"
                class="p-3 rounded-md border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
                @click="findActiveVerse(note)"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ note.userName }}</span>
                  <span class="text-xs text-gray-500"> Book level </span>
                </div>
                <p class="text-sm text-gray-700">{{ note.text }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(note.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Note Section -->
      <div class="flex-shrink-0 border-t pt-4">
        <div class="space-y-2">
          <textarea
            v-model="tmpNote"
            class="w-full p-2 text-sm border rounded-md resize-none"
            rows="3"
            placeholder="Add a note..."
          ></textarea>
          <div class="flex gap-2">
            <button
              @click="addNoteForLevel"
              :disabled="!tmpNote.trim() || (activeStudyLevel === 'verse' && !activeVerse)"
              class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Note
            </button>
            <button
              @click="cancelNote"
              class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions Section -->
    <div
      v-if="activeStudyTool === 'questions'"
      class="min-w-0 h-full justify-between flex flex-col overflow-hidden"
    >
      <!-- Questions Count Header -->
      <div v-if="activeStudyLevel === 'verse'" class="text-sm text-neutral-60 mb-2 px-2">
        <div v-if="filteredUserQuestions.length > 0">
          {{ filteredUserQuestions.length }} verse question{{
            filteredUserQuestions.length !== 1 ? 's' : ''
          }}
          for {{ currentBookId }}
        </div>
      </div>
      <div v-if="activeStudyLevel === 'chapter'" class="text-sm text-neutral-60 mb-2 px-2">
        <div v-if="chapterQuestions.length > 0">
          {{ chapterQuestions.length }} chapter question{{
            chapterQuestions.length !== 1 ? 's' : ''
          }}
          for {{ currentBookId }}
        </div>
      </div>
      <div v-if="activeStudyLevel === 'book'" class="text-sm text-neutral-60 mb-2 px-2">
        <div v-if="bookQuestions.length > 0">
          {{ bookQuestions.length }} book question{{ bookQuestions.length !== 1 ? 's' : '' }} for
          {{ currentBookId }}
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- Verse Level Questions -->
        <div v-if="activeStudyLevel === 'verse'">
          <div v-if="filteredUserQuestions.length > 0" class="flex flex-col gap-2 rounded-md p-2">
            <ul class="flex flex-col gap-2">
              <li
                v-for="group in groupedUserQuestions"
                :key="`${group.chapter}_${group.verse}`"
                class="bg-neutral-20 p-2 rounded-md transition-colors"
                :class="{
                  'bg-secondary':
                    activeVerse?.chapter === group.chapter && activeVerse?.verse === group.verse,
                }"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-neutral-70">
                    {{ currentBookId }} {{ group.chapter }}:{{ group.verse }}
                  </span>
                  <button
                    @click="findActiveVerseFromQuestion(group.questions[0])"
                    class="text-xs text-secondary hover:text-secondary-dk transition-colors"
                  >
                    Go to verse
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="question in group.questions"
                    :key="question.id"
                    class="bg-white p-2 rounded-md border-l-2 border-secondary"
                  >
                    <div v-if="editingQuestion === question.id" class="space-y-2">
                      <textarea
                        v-model="editingQuestionText"
                        class="w-full p-2 text-sm border rounded-md resize-none"
                        rows="3"
                        placeholder="Edit your question..."
                      ></textarea>
                      <div class="flex gap-2">
                        <button
                          @click="saveEditedQuestion"
                          class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk transition-colors"
                        >
                          Save
                        </button>
                        <button
                          @click="cancelEditingQuestion"
                          class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div v-else>
                      <p class="text-sm text-gray-800">{{ question.text }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-gray-500">{{ question.createdAt }}</span>
                        <div v-if="isCurrentUserQuestion(question)" class="flex gap-1">
                          <button
                            @click="startEditingQuestion(question)"
                            class="text-xs hover:text-secondary-dk transition-colors"
                            title="Edit question"
                          >
                            <HeroIcons.PencilIcon class="w-5 h-5" />
                          </button>
                          <button
                            @click="deleteQuestion(question)"
                            class="text-xs hover:text-red-700 transition-colors"
                            title="Delete question"
                          >
                            <HeroIcons.TrashIcon class="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">No questions yet</p>
            <p class="text-xs text-gray-400 mt-1">Click on a verse to add a question</p>
          </div>

          <!-- Study Group Questions -->
          <div v-if="otherUsersQuestions.length > 0" class="mt-4">
            <div class="text-sm text-neutral-60 mb-2 px-2">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Study Group Questions ({{ otherUsersQuestions.length }})
              </div>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-2 bg-orange-50">
              <div
                v-for="question in otherUsersQuestions"
                :key="question.id"
                class="p-3 rounded-md border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
                :class="{
                  'bg-secondary-lt shadow-md':
                    activeVerse &&
                    activeVerse.chapter === question.chapter &&
                    activeVerse.verse === question.verse,
                  'bg-white': !(
                    activeVerse &&
                    activeVerse.chapter === question.chapter &&
                    activeVerse.verse === question.verse
                  ),
                }"
                @click="findActiveVerseFromQuestion(question)"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-medium text-gray-900">{{ question.userName }}</span>
                  <span class="text-xs text-gray-500">
                    <span v-if="question.verse"
                      >Chapter {{ question.chapter }}, Verse {{ question.verse }}</span
                    >
                    <span v-else-if="question.chapter">Chapter {{ question.chapter }}</span>
                    <span v-else>Book level</span>
                  </span>
                </div>
                <p class="text-sm text-gray-700">{{ question.text }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(question.createdAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapter Level Questions -->
        <div v-if="activeStudyLevel === 'chapter'">
          <div v-if="chapterQuestions.length > 0" class="flex flex-col gap-2 rounded-md p-2">
            <ul class="flex flex-col gap-2">
              <li
                v-for="question in chapterQuestions"
                :key="question.id"
                class="bg-neutral-20 p-2 rounded-md transition-colors"
              >
                <div v-if="editingQuestion === question.id" class="space-y-2">
                  <textarea
                    v-model="editingQuestionText"
                    class="w-full p-2 text-sm border rounded-md resize-none"
                    rows="3"
                    placeholder="Edit your question..."
                  ></textarea>
                  <div class="flex gap-2">
                    <button
                      @click="saveEditedChapterQuestion"
                      class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk transition-colors"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditingQuestion"
                      class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div v-else>
                  <p class="text-sm text-gray-800">{{ question.text }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ question.createdAt }}</span>
                    <div v-if="isCurrentUserQuestion(question)" class="flex gap-1">
                      <button
                        @click="startEditingChapterQuestion(question)"
                        class="text-xs hover:text-secondary-dk transition-colors"
                        title="Edit question"
                      >
                        <HeroIcons.PencilIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="deleteChapterQuestion(question)"
                        class="text-xs hover:text-red-700 transition-colors"
                        title="Delete question"
                      >
                        <HeroIcons.TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">No chapter questions yet</p>
            <p class="text-xs text-gray-400 mt-1">Add questions for the entire chapter</p>
          </div>
        </div>

        <!-- Book Level Questions -->
        <div v-if="activeStudyLevel === 'book'">
          <div v-if="bookQuestions.length > 0" class="flex flex-col gap-2 rounded-md p-2">
            <ul class="flex flex-col gap-2">
              <li
                v-for="question in bookQuestions"
                :key="question.id"
                class="bg-neutral-20 p-2 rounded-md transition-colors"
              >
                <div v-if="editingQuestion === question.id" class="space-y-2">
                  <textarea
                    v-model="editingQuestionText"
                    class="w-full p-2 text-sm border rounded-md resize-none"
                    rows="3"
                    placeholder="Edit your question..."
                  ></textarea>
                  <div class="flex gap-2">
                    <button
                      @click="saveEditedBookQuestion"
                      class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk transition-colors"
                    >
                      Save
                    </button>
                    <button
                      @click="cancelEditingQuestion"
                      class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div v-else>
                  <p class="text-sm text-gray-800">{{ question.text }}</p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">{{ question.createdAt }}</span>
                    <div v-if="isCurrentUserQuestion(question)" class="flex gap-1">
                      <button
                        @click="startEditingBookQuestion(question)"
                        class="text-xs hover:text-secondary-dk transition-colors"
                        title="Edit question"
                      >
                        <HeroIcons.PencilIcon class="w-5 h-5" />
                      </button>
                      <button
                        @click="deleteBookQuestion(question)"
                        class="text-xs hover:text-red-700 transition-colors"
                        title="Delete question"
                      >
                        <HeroIcons.TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <p class="text-sm">No book questions yet</p>
            <p class="text-xs text-gray-400 mt-1">Add questions for the entire book</p>
          </div>
        </div>
      </div>

      <!-- Add Question Section -->
      <div class="flex-shrink-0 border-t pt-4">
        <div class="space-y-2">
          <textarea
            v-model="tmpQuestion"
            class="w-full p-2 text-sm border rounded-md resize-none"
            rows="3"
            placeholder="Add a question..."
          ></textarea>
          <div class="flex gap-2">
            <button
              @click="addQuestionForLevel"
              :disabled="!tmpQuestion.trim() || (activeStudyLevel === 'verse' && !activeVerse)"
              class="px-3 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-dk disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Question
            </button>
            <button
              @click="cancelQuestion"
              class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
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
            class="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
