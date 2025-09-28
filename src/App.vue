<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import TheNav from '@/components/TheNav.vue'

const route = useRoute()
const router = useRouter()
const logoAnimationComplete = ref(false)
const showContent = ref(false)
const hasPlayedAnimation = ref(false) // Track if animation has been played

// Only play animation on home route and only once
const shouldPlayAnimation = ref(route.path === '/' && !hasPlayedAnimation.value)

onMounted(() => {
  if (shouldPlayAnimation.value) {
    // Start the logo animation sequence only on home route and only once
    hasPlayedAnimation.value = true // Mark animation as played
    setTimeout(() => {
      logoAnimationComplete.value = true
      // Show content after logo animation completes
      setTimeout(() => {
        showContent.value = true
      }, 1000) // Wait for logo to move to top-left
    }, 2000) // Logo stays centered for 2 seconds
  } else {
    // Skip animation on other routes or if already played
    logoAnimationComplete.value = true
    showContent.value = true
  }
})

// Watch for route changes
watch(route, (newRoute) => {
  if (newRoute.path === '/') {
    // Only play animation if it hasn't been played yet
    if (!hasPlayedAnimation.value) {
      shouldPlayAnimation.value = true
      hasPlayedAnimation.value = true
      // Reset animation state for home route
      logoAnimationComplete.value = false
      showContent.value = false
      // Play animation
      setTimeout(() => {
        logoAnimationComplete.value = true
        setTimeout(() => {
          showContent.value = true
        }, 1000)
      }, 2000)
    } else {
      // Animation already played, just show content
      shouldPlayAnimation.value = false
      logoAnimationComplete.value = true
      showContent.value = true
    }
  } else {
    shouldPlayAnimation.value = false
    logoAnimationComplete.value = true
    showContent.value = true
  }
})

// Navigate to home when logo is clicked
const navigateToHome = () => {
  router.push('/')
}

// Provide the animation state to child components
provide('showContent', showContent)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-secondary-lt relative overflow-hidden">
    <!-- Animated Logo -->
    <div
      class="fixed transition-all duration-1000 ease-in-out z-50 cursor-pointer"
      :class="{
        'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2': !logoAnimationComplete,
        'top-6 left-6 transform-none opacity-0': logoAnimationComplete,
      }"
      @click="navigateToHome"
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
