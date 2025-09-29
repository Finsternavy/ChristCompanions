import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref(null)
  const isLoading = ref(false)

  // Actions
  const signIn = async (email, password) => {
    isLoading.value = true

    try {
      // TODO: Implement actual authentication logic here
      // For now, just simulate a successful sign in
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Set user data
      user.value = {
        email,
        id: 'user_' + Date.now(),
        createdAt: new Date().toISOString(),
      }

      isAuthenticated.value = true

      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      localStorage.setItem('auth_authenticated', 'true')

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email, password) => {
    isLoading.value = true

    try {
      // TODO: Implement actual registration logic here
      // For now, just simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Set user data
      user.value = {
        email,
        id: 'user_' + Date.now(),
        createdAt: new Date().toISOString(),
      }

      isAuthenticated.value = true

      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      localStorage.setItem('auth_authenticated', 'true')

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const signOut = () => {
    isAuthenticated.value = false
    user.value = null

    // Clear localStorage
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_authenticated')
  }

  const checkAuth = () => {
    // Check if user is authenticated from localStorage
    const storedAuth = localStorage.getItem('auth_authenticated')
    const storedUser = localStorage.getItem('auth_user')

    if (storedAuth === 'true' && storedUser) {
      isAuthenticated.value = true
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    isLoading,

    // Actions
    signIn,
    register,
    signOut,
    checkAuth,
  }
})
