import { createRouter, createWebHashHistory } from 'vue-router'
// import HomeView from '@/views/HomeView.vue'
import PerformanceView from '@/views/PerformanceView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PerformanceView,
    },
    {
      path: '/demo',
      name: 'demo',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/DemoView.vue'),
    },
    {
      path: '/parinn',
      name: 'parinn',
      component: () => import('../views/PariView.vue'),
    },
    {
      path: '/parinn-list',
      name: 'parinn-list',
      component: () => import('../views/ParinnList.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/create-event',
      name: 'create-event',
      component: () => import('../views/VkPostView.vue'),
    },
  ],
})

export default router
