<script setup>
import { inject, ref } from 'vue'
import { RouterLink } from 'vue-router'

const showContent = inject('showContent', ref(false))
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Main Content Area -->
    <div
      class="transition-all duration-1000 ease-in-out pt-20 h-full overflow-y-auto"
      :class="{
        'opacity-100': showContent,
        'opacity-0': !showContent,
      }"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Christ Companions</h2>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal Bible study companion with powerful tools for reading, note-taking, and
            spiritual growth.
          </p>
          <RouterLink
            to="/bible"
            class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dk transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Start Reading
          </RouterLink>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="text-center p-6 bg-white/60 rounded-xl shadow-lg">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Text-to-Speech</h3>
            <p class="text-gray-600">
              Listen to the Bible with high-quality text-to-speech technology
            </p>
          </div>

          <div class="text-center p-6 bg-white/60 rounded-xl shadow-lg">
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Take Notes</h3>
            <p class="text-gray-600">
              Add personal notes and questions at verse, chapter, and book levels
            </p>
          </div>

          <div class="text-center p-6 bg-white/60 rounded-xl shadow-lg">
            <div
              class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Multiple Versions</h3>
            <p class="text-gray-600">Compare different Bible translations side by side</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
</style>
