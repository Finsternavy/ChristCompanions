<script setup>
import { ref, onMounted, computed } from 'vue'

const model = defineModel()
// const props = defineProps({
//   translation: {
//     type: String,
//     default: 'kjv',
//   },
//   book: {
//     type: String,
//     required: true,
//   },
//   chapter: {
//     type: Number,
//     required: true,
//   },
// })

const loading = ref(true)
const error = ref(null)
const verses = ref([])
const bookName = ref('')
const chapterSummary = ref('')

const loadChapter = async () => {
  try {
    loading.value = true
    error.value = null

    // Load the chapter with all content
    const chapterData = await BibleContentService.loadChapterWithContent(
      props.translation,
      props.book,
      props.chapter,
    )

    verses.value = chapterData

    // Load book info for display
    const bookData = await BibleContentService.loadBook(props.book)
    bookName.value = bookData.name

    // Load chapter info for summary
    const chapterInfo = await BibleContentService.loadChapter(
      `${props.translation}_${props.book}_${props.chapter}`,
    )
    chapterSummary.value = chapterInfo.summary
  } catch (err) {
    error.value = err.message
    console.error('Error loading chapter:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  // loadChapter()
})
</script>

<template>
  <div class="chapter-viewer">
    <div v-if="loading" class="loading">Loading chapter...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="chapter-content">
      <header class="chapter-header">
        <h1>{{ bookName }} {{ chapterNumber }}</h1>
        <p class="chapter-summary">{{ chapterSummary }}</p>
      </header>

      <div class="verses">
        <div v-for="verse in verses" :key="verse.id" class="verse-container">
          <div class="verse">
            <span class="verse-number">{{ verse.verse }}</span>
            <span class="verse-text">{{ verse.text }}</span>
          </div>

          <!-- Notes for this verse -->
          <div v-if="verse.notes.length > 0" class="notes">
            <h4>Notes:</h4>
            <div v-for="note in verse.notes" :key="note.id" class="note">
              <p>{{ note.content }}</p>
              <div class="note-meta">
                <span class="note-tags">
                  <span v-for="tag in note.tags" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </span>
                <span class="note-date">{{ formatDate(note.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Questions for this verse -->
          <div v-if="verse.questions.length > 0" class="questions">
            <h4>Questions:</h4>
            <div v-for="question in verse.questions" :key="question.id" class="question">
              <p>{{ question.question }}</p>
              <div class="question-meta">
                <span class="question-status" :class="question.status">
                  {{ question.status }}
                </span>
                <span class="question-date">{{ formatDate(question.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chapter-viewer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.chapter-header {
  margin-bottom: 30px;
  text-align: center;
}

.chapter-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.chapter-summary {
  color: #7f8c8d;
  font-style: italic;
}

.verse-container {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  background: #fafafa;
}

.verse {
  margin-bottom: 15px;
  line-height: 1.6;
}

.verse-number {
  font-weight: bold;
  color: #3498db;
  margin-right: 8px;
}

.verse-text {
  font-size: 16px;
}

.notes,
.questions {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.questions {
  border-left-color: #e74c3c;
}

.notes h4,
.questions h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.note,
.question {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.note:last-child,
.question:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.note-meta,
.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.note-tags {
  display: flex;
  gap: 5px;
}

.tag {
  background: #3498db;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.question-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.question-status.open {
  background: #f39c12;
  color: white;
}

.question-status.answered {
  background: #27ae60;
  color: white;
}
</style>
