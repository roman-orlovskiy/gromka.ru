import { createRouter, createWebHashHistory } from 'vue-router'
// import HomeView from '@/views/HomeView.vue'
// import PerformanceView from '@/views/PerformanceView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
    },
    {
      path: '/spartak',
      name: 'spartak',
      component: () => import('../views/SpartakView.vue'),
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
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: (to) => {
        const requiredHash = 'hjslk17ldsvcu255iongh'
        const providedHash = to.query.hash

        if (!requiredHash) {
          // Если хэш не задан в окружении, блокируем доступ
          return { path: '/' }
        }

        if (typeof providedHash !== 'string') {
          return { path: '/' }
        }

        if (providedHash !== requiredHash) {
          return { path: '/' }
        }

        return true
      },
    },
    {
      path: '/flashlight',
      name: 'flashlight',
      component: () => import('../views/FlashlightView.vue'),
    },
  ],
})

export default router
