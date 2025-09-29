<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import TheNav from '@/components/TheNav.vue'
import LogoIcon from '@/components/Logo.vue'

const route = useRoute()
const router = useRouter()
const logoAnimationComplete = ref(false)
const showContent = ref(false)
const logoColorPhase = ref('transparent') // 'transparent', 'gold', 'transparent', 'fade'
const logoOpacity = ref(1)

// Play animation on home route
const shouldPlayAnimation = ref(route.path === '/')

onMounted(() => {
  if (shouldPlayAnimation.value) {
    // Start the enhanced logo animation sequence
    startLogoAnimation()
  } else {
    // Skip animation on other routes
    logoAnimationComplete.value = true
    showContent.value = true
  }
})

// Watch for route changes
watch(route, (newRoute) => {
  if (newRoute.path === '/') {
    // Play animation when navigating to home
    shouldPlayAnimation.value = true
    logoAnimationComplete.value = false
    showContent.value = false
    logoColorPhase.value = 'transparent'
    logoOpacity.value = 1
    startLogoAnimation()
  } else {
    // Skip animation on other routes
    shouldPlayAnimation.value = false
    logoAnimationComplete.value = true
    showContent.value = true
  }
})

const startLogoAnimation = () => {
  // Phase 1: Start with transparent (already set)
  setTimeout(() => {
    // Phase 2: Change to bright gold
    logoColorPhase.value = 'gold'
  }, 1000)

  setTimeout(() => {
    // Phase 3: Change back to transparent
    logoColorPhase.value = 'transparent'
  }, 2000)

  setTimeout(() => {
    // Phase 4: Fade out the entire logo container
    logoOpacity.value = 0
  }, 3000)

  setTimeout(() => {
    // Phase 5: Animation complete, show content
    logoAnimationComplete.value = true
    showContent.value = true
  }, 4000)
}

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
      class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 cursor-pointer transition-opacity duration-1000 ease-in-out"
      :style="{ opacity: logoOpacity }"
      @click="navigateToHome"
    >
      <div class="w-[80vw] h-[80vh] flex items-center justify-center">
        <!-- Logo Icon -->
        <LogoIcon
          :primaryColor="logoColorPhase === 'gold' ? '#FFD700' : '#b3980000'"
          :secondaryColor="'#222222'"
          :width="'100%'"
          :height="'100%'"
          class="transition-colors duration-500 ease-in-out"
        />
        <!-- Logo Text -->
        <!-- <div
          class="transition-all duration-500 ease-in-out"
          :class="{
            'opacity-100 scale-100': logoColorPhase === 'gold',
            'opacity-0 scale-95': logoColorPhase !== 'gold',
          }"
        >
          <h1 class="text-2xl font-bold text-primary">Christ Companions</h1>
        </div> -->
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
