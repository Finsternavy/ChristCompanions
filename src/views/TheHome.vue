<script setup>
import { inject, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const showContent = inject('showContent', ref(false))
const authStore = useAuthStore()

// Check authentication status
authStore.checkAuth()

// Computed properties for authentication state
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Form state
const showSignIn = ref(true) // Start with sign in form
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')

// Toggle between sign in and register forms
const toggleForm = () => {
  showSignIn.value = !showSignIn.value
  // Clear form data when switching
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  error.value = ''
}

// Handle sign in
const handleSignIn = async () => {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.signIn(email.value, password.value)
    console.log(result)
    if (result.success) {
      router.push('/bible')
      // Form will automatically hide due to authentication state change
    } else {
      error.value = result.error || 'Invalid email or password. Please try again.'
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Handle registration
const handleRegister = async () => {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.register(email.value, password.value)

    if (result.success) {
      // Form will automatically hide due to authentication state change
    } else {
      error.value = result.error || 'Registration failed. Please try again.'
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
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

          <!-- Show different content based on authentication status -->
          <template v-if="isAuthenticated">
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
          </template>
          <template v-else>
            <div class="max-w-md mx-auto">
              <p class="text-lg text-gray-700 mb-8 text-center">
                Please sign in or register to access the Bible reading features.
              </p>

              <!-- Authentication Forms Container -->
              <div
                class="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 min-h-[500px]"
              >
                <!-- Sign In Form -->
                <div
                  class="p-8 h-full flex flex-col justify-center transition-all duration-500 ease-in-out"
                  :class="{
                    'translate-x-0 opacity-100': showSignIn,
                    'translate-x-full opacity-0 absolute inset-0': !showSignIn,
                  }"
                >
                  <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h3>
                  <form @submit.prevent="handleSignIn" class="space-y-4">
                    <div>
                      <label
                        for="signin-email"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email address
                      </label>
                      <input
                        id="signin-email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label
                        for="signin-password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        id="signin-password"
                        v-model="password"
                        type="password"
                        autocomplete="current-password"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Enter your password"
                      />
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <input
                          id="remember-me"
                          v-model="rememberMe"
                          type="checkbox"
                          class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label for="remember-me" class="ml-2 text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div v-if="error" class="text-red-600 text-sm text-center">
                      {{ error }}
                    </div>
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dk focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span v-if="isLoading" class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </span>
                      <span v-else>Sign In</span>
                    </button>
                    <div class="text-center">
                      <button
                        type="button"
                        @click="toggleForm"
                        class="text-sm text-primary hover:text-primary-dk font-medium"
                      >
                        Don't have an account? Create one here
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Register Form -->
                <div
                  class="p-8 h-full flex flex-col justify-center transition-all duration-500 ease-in-out"
                  :class="{
                    'translate-x-0 opacity-100': !showSignIn,
                    'translate-x-full opacity-0 absolute inset-0': showSignIn,
                  }"
                >
                  <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h3>
                  <form @submit.prevent="handleRegister" class="space-y-4">
                    <div>
                      <label
                        for="register-email"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email address
                      </label>
                      <input
                        id="register-email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label
                        for="register-password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <input
                        id="register-password"
                        v-model="password"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Create a password"
                      />
                    </div>
                    <div>
                      <label
                        for="confirm-password"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password
                      </label>
                      <input
                        id="confirm-password"
                        v-model="confirmPassword"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Confirm your password"
                      />
                    </div>
                    <div v-if="error" class="text-red-600 text-sm text-center">
                      {{ error }}
                    </div>
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dk focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span v-if="isLoading" class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating account...
                      </span>
                      <span v-else>Create Account</span>
                    </button>
                    <div class="text-center">
                      <button
                        type="button"
                        @click="toggleForm"
                        class="text-sm text-primary hover:text-primary-dk font-medium"
                      >
                        Already have an account? Sign in here
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </template>
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
