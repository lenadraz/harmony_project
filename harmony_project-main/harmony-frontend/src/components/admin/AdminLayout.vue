<template>
  <div class="admin-page">
    <AdminSidebar />

    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from './AdminSidebar.vue'
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  background: #f5f7f9;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  background: #f5f7f9;
}
</style>