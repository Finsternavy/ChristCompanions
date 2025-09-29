<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Logo from '@/components/logos/crossCompanionLogo.svg'
import LogoIcon from '@/components/Logo.vue'

const router = useRouter()
const authStore = useAuthStore()
const showTopNav = ref(false)

onMounted(() => {
  // Check authentication status on mount
  authStore.checkAuth()

  // Show top nav after a delay to allow for any page-specific animations
  setTimeout(() => {
    showTopNav.value = true
  }, 500) // Small delay to ensure smooth transition
})

// Navigate to home when logo is clicked
const navigateToHome = () => {
  router.push('/')
}

// Sign out function
const handleSignOut = () => {
  authStore.signOut()
  router.push('/')
}

// Computed properties for authentication state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
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
        <div class="flex items-center gap-3 cursor-pointer" @click="navigateToHome">
          <!-- <img :src="Logo" alt="Logo" class="w-10 h-10" /> -->
          <LogoIcon class="w-10 h-10" primaryColor="#b3980000" secondaryColor="#b39800" />
          <span class="text-xl font-bold text-primary">Christ Companions</span>
        </div>

        <!-- Navigation Links -->
        <div class="flex items-center space-x-4">
          <!-- Show different options based on authentication status -->
          <template v-if="isAuthenticated">
            <!-- Authenticated user options -->
            <router-link
              to="/bible"
              class="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Read Bible
            </router-link>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">{{ user?.email }}</span>
              <button
                @click="handleSignOut"
                class="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Sign Out
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.gold {
  color: #b39800;
}
</style>
