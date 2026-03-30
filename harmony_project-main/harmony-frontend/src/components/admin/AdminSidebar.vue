<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <h2>Harmony</h2>
      <p>Admin Panel</p>
    </div>

    <nav class="sidebar-nav">

      <!-- Main -->
      <RouterLink to="/admin/dashboard" class="nav-link">
        Dashboard
      </RouterLink>

      <RouterLink to="/admin/events" class="nav-link">
        Events
      </RouterLink>

      <RouterLink to="/admin/profile" class="nav-link">
        Profile
      </RouterLink>

      <hr class="divider" />

      <!-- Legal -->
      <RouterLink to="/admin/privacy" class="nav-link">
        Privacy Policy
      </RouterLink>

      <RouterLink to="/admin/terms" class="nav-link">
        Terms of Use
      </RouterLink>

      <hr class="divider" />

      <!-- Logout -->
      <button class="logout-btn" @click="logout">
        Logout
      </button>

    </nav>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  min-height: 100vh;
  background: #1f3b2d;
  color: white;
  padding: 20px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 22px;
}

.sidebar-header p {
  font-size: 13px;
  opacity: 0.7;
}

.sidebar-nav {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
}

.nav-link {
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  margin-bottom: 5px;
  transition: background 0.2s;
}

.nav-link:hover {
  background: #2e8b57;
}

.divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.2);
  margin: 15px 0;
}

.logout-btn {
  margin-top: 10px;
  padding: 12px;
  background: #d9534f;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c9302c;
}
</style>