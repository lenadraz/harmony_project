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

// Admin views
import AdminLoginView from '../views/admin/AdminLoginView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminEventsView from '../views/admin/AdminEventsView.vue'
import AdminProfileView from '../views/admin/AdminProfileView.vue'
import AdminPrivacyView from '../views/admin/AdminPrivacyView.vue'
import AdminTermsView from '../views/admin/AdminTermsView.vue'
import AdminEventDetailsView from '../views/admin/AdminEventDetailsView.vue'

// Participant helper:
// If a participant id exists in localStorage, build a route with that id.
// Otherwise, redirect the user to the login page.
const withPidOrLogin = (base) => {
  const pid = localStorage.getItem('harmony_pid')
  return pid ? `/${base}/${pid}` : '/login'
}

// Admin helper:
// If admin is authenticated, allow access.
// Otherwise, redirect to admin login.
const withAdminAuthOrLogin = () => {
  const isAdminAuth = localStorage.getItem('harmony_admin_auth') === 'true'
  return isAdminAuth ? true : '/admin/login'
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

    // Admin routes
    { path: '/admin', redirect: '/admin/login' },
    { path: '/admin/login', component: AdminLoginView },
    {path: '/admin/dashboard', component: AdminDashboardView, beforeEnter: withAdminAuthOrLogin },
    {path: '/admin/events', component: AdminEventsView, beforeEnter: withAdminAuthOrLogin },
    {path: '/admin/events/:id', component: AdminEventDetailsView, beforeEnter: withAdminAuthOrLogin },
    {path: '/admin/profile', component: AdminProfileView, beforeEnter: withAdminAuthOrLogin },
    {path: '/admin/privacy', component: AdminPrivacyView, beforeEnter: withAdminAuthOrLogin },
    {path: '/admin/terms', component: AdminTermsView, beforeEnter: withAdminAuthOrLogin },

    /* Admin routes are protected by the withAdminAuthOrLogin guard, which checks for admin authentication.
       If the user is not authenticated as an admin, they will be redirected to the admin login 
       page.
    i will add the admin routes back in once i have the admin login working, for now they are 
    commented out to avoid confusion and errors during development. 
    { path: '/admin', redirect: '/admin/login' },
    { path: '/admin/login', component: AdminLoginView },
    { path: '/admin/dashboard', component: AdminDashboardView, beforeEnter: withAdminAuthOrLogin },
    { path: '/admin/events', component: AdminEventsView, beforeEnter: withAdminAuthOrLogin },
    { path: '/admin/events/:id', component: AdminEventDetailsView, beforeEnter: withAdminAuthOrLogin },
    { path: '/admin/profile', component: AdminProfileView, beforeEnter: withAdminAuthOrLogin },
    { path: '/admin/privacy', component: AdminPrivacyView, beforeEnter: withAdminAuthOrLogin },
    { path: '/admin/terms', component: AdminTermsView, beforeEnter: withAdminAuthOrLogin },
      */ 
  ],
})

// Export router instance to be used by the Vue app
export default router