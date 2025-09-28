<script setup>
import { ref, onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import TheNav from '@/components/TheNav.vue'

const logoAnimationComplete = ref(false)
const showContent = ref(false)

onMounted(() => {
  // Start the logo animation sequence
  setTimeout(() => {
    logoAnimationComplete.value = true
    // Show content after logo animation completes
    setTimeout(() => {
      showContent.value = true
    }, 1000) // Wait for logo to move to top-left
  }, 2000) // Logo stays centered for 2 seconds
})

// Provide the animation state to child components
provide('showContent', showContent)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-secondary-lt relative overflow-hidden">
    <!-- Animated Logo -->
    <div
      class="fixed transition-all duration-1000 ease-in-out z-50"
      :class="{
        'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2': !logoAnimationComplete,
        'top-6 left-6 transform-none opacity-0': logoAnimationComplete,
      }"
    >
      <div class="flex items-center gap-3">
        <!-- Logo Icon -->
        <div
          class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-gray-200"
        >
          <svg
            class="w-8 h-8 text-black"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            viewBox="0 0 24 24"
          >
            <path d="M12 2v20M2 12h20" />
          </svg>
        </div>
        <!-- Logo Text -->
        <div
          class="transition-all duration-1000 ease-in-out"
          :class="{
            'opacity-100 scale-100': logoAnimationComplete,
            'opacity-0 scale-95': !logoAnimationComplete,
          }"
        >
          <h1 class="text-2xl font-bold text-primary">Christ Companions</h1>
        </div>
      </div>
    </div>

    <TheNav />
    <RouterView />
  </div>
</template>

<style scoped>
.gold {
  color: #b39800;
}
</style>
