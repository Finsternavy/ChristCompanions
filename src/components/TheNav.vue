<script setup>
import { ref, onMounted } from 'vue'

const showTopNav = ref(false)

onMounted(() => {
  // Show top nav after a delay to allow for any page-specific animations
  setTimeout(() => {
    showTopNav.value = true
  }, 500) // Small delay to ensure smooth transition
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-500 ease-in-out z-50"
    :class="{
      'opacity-100 translate-y-0': showTopNav,
      'opacity-0 -translate-y-full': !showTopNav,
    }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo in Top Nav -->
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200"
          >
            <svg
              class="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <span class="text-xl font-bold text-primary">Christ Companions</span>
        </div>

        <!-- Navigation Links (placeholder for future) -->
        <div class="hidden md:flex items-center space-x-8">
          <!-- Navigation items will go here -->
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
