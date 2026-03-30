<template>
  <AdminLayout>
    <div class="event-details-page">
      <div class="page-header">
        <div>
          <h1>Event Details</h1>
          <p>Manage this event and its matching setup.</p>
        </div>
      </div>

      <div class="details-card">
        <h2>Harmony Event</h2>
        <p><strong>Event ID:</strong> {{ eventId }}</p>
        <p><strong>Date:</strong> Not set yet</p>
        <p><strong>Language:</strong> Not set yet</p>
        <p><strong>Participants File:</strong> Not uploaded yet</p>
        <p><strong>Match Features:</strong> Not selected yet</p>
      </div>

      <div class="actions-card">
        <h3>Actions</h3>
        <div class="actions">
          <button>Upload Participants File</button>
          <button>Choose Match Features</button>
          <button>Generate Matches</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'

const route = useRoute()
const eventId = computed(() => route.params.id)
</script>

<style scoped>
.event-details-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header h1 {
  margin: 0;
  color: #1f3b2d;
}

.page-header p {
  margin: 0.5rem 0 0;
  color: #5f6f66;
}

.details-card,
.actions-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.details-card h2,
.actions-card h3 {
  margin-top: 0;
  color: #234532;
}

.details-card p {
  margin: 0.5rem 0;
  color: #4f5f57;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.actions button {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 10px;
  background: #2e8b57;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
</style>