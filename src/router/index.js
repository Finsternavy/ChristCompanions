import { createRouter, createWebHistory } from 'vue-router'
import TheHome from '@/views/TheHome.vue'
import Bible from '@/views/Bible.vue'

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
    },
  ],
})

export default router
