import { createRouter, createWebHistory } from 'vue-router'
import TheHome from '@/views/TheHome.vue'
import Bible from '@/views/Bible.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TheHome,
    },
    {
      path: '/bible',
      name: 'bible',
      component: Bible,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check authentication status
  authStore.checkAuth()

  // If route requires authentication
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      next()
    } else {
      // Redirect to sign in page
      next('/signin')
    }
  } else {
    next()
  }
})

export default router
