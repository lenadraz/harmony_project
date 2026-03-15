<template>
  <AdminLayout>
    <div class="events-page">
      <div class="events-header">
        <div>
          <h1>Events</h1>
          <p>Search, filter, and create Harmony events.</p>
        </div>

        <button class="new-event-btn" @click="openCreateModal = true">
          + New Event
        </button>
      </div>

      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search events..."
        />

        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div v-if="filteredEvents.length === 0" class="empty-state">
        <h3>No events found</h3>
        <p>Create a new event to get started.</p>
      </div>

      <div v-else class="events-list">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card clickable"
          @click="goToEventDetails(event.id)"
        >
          <h3>{{ event.name }}</h3>
          <p><strong>Date:</strong> {{ event.date }}</p>
          <p><strong>Language:</strong> {{ event.language }}</p>
          <p><strong>Status:</strong> {{ event.status }}</p>
        </div>
      </div>

      <div v-if="openCreateModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h2>Create New Event</h2>
            <button class="close-btn" @click="closeModal">×</button>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Event Name</label>
              <input
                v-model="newEvent.name"
                type="text"
                placeholder="Enter event name"
              />
            </div>

            <div class="form-group">
              <label>Event Date</label>
              <input v-model="newEvent.date" type="date" />
            </div>

            <div class="form-group">
              <label>Language</label>
              <div class="language-switch">
                <button
                  v-for="lang in languages"
                  :key="lang"
                  type="button"
                  :class="['lang-btn', { active: newEvent.language === lang }]"
                  @click="newEvent.language = lang"
                >
                  {{ lang }}
                </button>
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeModal">Cancel</button>
            <button class="save-btn" @click="createEvent">Create Event</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../../components/admin/AdminLayout.vue'

const router = useRouter()

const searchQuery = ref('')
const selectedStatus = ref('')
const openCreateModal = ref(false)
const errorMessage = ref('')

const languages = ['English', 'Arabic', 'Hebrew']

const events = ref([])

const newEvent = ref({
  name: '',
  date: '',
  language: '',
})

const filteredEvents = computed(() => {
  return events.value.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      !selectedStatus.value || event.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

function goToEventDetails(eventId) {
  router.push(`/admin/events/${eventId}`)
}

function closeModal() {
  openCreateModal.value = false
  errorMessage.value = ''
  newEvent.value = {
    name: '',
    date: '',
    language: '',
  }
}

function createEvent() {
  if (
    !newEvent.value.name.trim() ||
    !newEvent.value.date ||
    !newEvent.value.language
  ) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  events.value.push({
    id: Date.now(),
    name: newEvent.value.name.trim(),
    date: newEvent.value.date,
    language: newEvent.value.language,
    status: 'draft',
    participantsUploaded: false,
    matchFeatures: [],
  })

  closeModal()
}
</script>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.events-header h1 {
  margin: 0;
  color: #1f3b2d;
}

.events-header p {
  margin: 0.5rem 0 0;
  color: #5f6f66;
}

.new-event-btn {
  padding: 0.9rem 1.2rem;
  border: none;
  border-radius: 12px;
  background: #2e8b57;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.toolbar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  background: white;
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.search-input,
.filter-select,
.form-group input {
  padding: 0.85rem 1rem;
  border: 1px solid #d5ddd8;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  min-width: 220px;
}

.filter-select {
  min-width: 180px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #234532;
}

.empty-state p {
  margin: 0;
  color: #66756d;
}

.events-list {
  display: grid;
  gap: 1rem;
}

.event-card {
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.event-card h3 {
  margin-top: 0;
  color: #234532;
}

.event-card p {
  margin: 0.35rem 0;
  color: #4f5f57;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 2000;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: #1f3b2d;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #607066;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group label {
  font-weight: 600;
  color: #234532;
}

.language-switch {
  display: flex;
  background: #e8eeea;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.lang-btn {
  flex: 1;
  padding: 0.8rem 0.9rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #234532;
}

.lang-btn.active {
  background: #2e8b57;
  color: white;
}

.error-message {
  margin: 1rem 0 0;
  color: #c0392b;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.save-btn {
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #e7ece9;
  color: #234532;
}

.save-btn {
  background: #2e8b57;
  color: white;
}
</style>