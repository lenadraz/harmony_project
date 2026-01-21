/**
 * router/index.js
 * Purpose: Central routing configuration for the Harmony frontend.
 * Why: Defines all application routes and ensures users are always routed
 *      with a valid participant id (pid) or redirected to login.
 * Design choice: Participant id is part of the URL to keep routing explicit
 *                and bookmarkable.
 */

import { createRouter, createWebHistory } from 'vue-router'

// Main application views (pages)
import LoginView from '../views/LoginView.vue'
import MatchesView from '../views/MatchesView.vue'
import SavedView from '../views/SavedView.vue'
import MetView from '../views/MetView.vue'
import ProfileView from '../views/ProfileView.vue'

// Helper function:
// If a participant id exists in localStorage, build a route with that id.
// Otherwise, redirect the user to the login page.
const withPidOrLogin = (base) => {
    // harmony_pid is stored after login and reused for navigation
  const pid = localStorage.getItem('harmony_pid')
  return pid ? `/${base}/${pid}` : '/login'
}

// Router configuration using HTML5 history mode (clean URLs, no hash)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Default entry point: redirect root access to login
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },

    // Routes without id:
// If accessed directly, automatically redirect using stored pid
    { path: '/matches', redirect: () => withPidOrLogin('matches') },
    { path: '/saved', redirect: () => withPidOrLogin('saved') },
    { path: '/met', redirect: () => withPidOrLogin('met') },
    { path: '/profile', redirect: () => withPidOrLogin('profile') },

    // Actual application routes with participant id
    { path: '/matches/:id', component: MatchesView },
    { path: '/saved/:id', component: SavedView },
    { path: '/met/:id', component: MetView },
    { path: '/profile/:id', component: ProfileView },
  ],
})

// Export router instance to be used by the Vue app
export default router
