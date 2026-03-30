/**
 * SavedView.vue
 * Purpose: Displays the list of profiles the participant marked as "Saved".
 * How it works:
 * - Saved items are stored locally per participant (localStorage key harmony_saved).
 * - On load, we fetch the matches list from the backend and filter it by the saved IDs set.
 * Design choices:
 * - We reuse the same /api/match/:pid endpoint (single source of match data) instead of storing full profiles in localStorage.
 * - Saved state is per participant (pid) so different users don't see each other's saved list.
 * - Language selection + RTL are persisted using localStorage for consistent UX across views.
 */

<template>
  <div class="container">
    <div class="shell" :dir="isRtl ? 'rtl' : 'ltr'">
      <!-- background decorations -->
      <div class="blob blob1" aria-hidden="true"></div>
      <div class="blob blob2" aria-hidden="true"></div>
      <div class="blob blob3" aria-hidden="true"></div>

      <div class="page">
        <!-- Shared top navigation; we pass the current language and participantId so links keep the same user context -->
        <TopNav :lang="lang" :pid="participantId()" />


        <!-- header + language -->
        <div class="headerRow">
          <div class="titles">
            <h1 class="h1">{{ t.title }}</h1>
            <p class="subtitle">{{ t.subtitle }}</p>
          </div>

          <div class="langBox">
            <span class="langIcon" aria-hidden="true">🌐</span>
            <select class="langSelect" v-model="lang">
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="he">Hebrew</option>
            </select>
          </div>
        </div>
        
        <!-- Empty state: shown when the user has not saved any profiles yet -->
        <div v-if="savedMatches.length === 0" class="empty">
          <div class="emptyIcon" aria-hidden="true">⭐</div>
          <div class="emptyText">
            <div class="emptyTitle">{{ t.emptyTitle }}</div>
            <div class="emptySub">{{ t.emptySub }}</div>
          </div>
        </div>

        <!-- Saved list: we render only the matches that appear in localStorage saved IDs -->
        <div v-else class="list">
          <div v-for="m in savedMatches" :key="m.id" class="card">
            <div class="cardGlow" aria-hidden="true"></div>

            <div class="cardHeader">
              <div class="info">
                <div class="name">{{ pick(m.name) }}</div>
                <div class="role">{{ pick(m.role) }}</div>
              </div>

              <img class="avatar" :src="m.avatar" alt="avatar" />
            </div>

            <div class="why">
              <strong>{{ t.why }}</strong>
              {{ pick(m.whyMatched) }}
            </div>

            <div class="actions">
              <button class="btn btnOutline" @click="unsave(m)">
                {{ t.remove }}
              </button>
            </div>
          </div>
        </div>

        <div class="spacerBottom"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/components/TopNav.vue'
  
// Read participant id from route params (/saved/:id) to load user-specific saved data.
const route = useRoute()

// Language + RTL:
// Store chosen language in localStorage and switch direction (dir) for Arabic/Hebrew.
const LANG_KEY = 'harmony_lang'
const lang = ref(localStorage.getItem(LANG_KEY) || 'en')
watch(lang, v => localStorage.setItem(LANG_KEY, v), { immediate: true })

const TEXTS = {
  en: {
    title: 'Saved',
    subtitle: 'Profiles you saved for later',
    emptyTitle: 'No saved profiles yet',
    emptySub: 'Go to Matches and tap “Save” on someone you want to remember.',
    why: 'Why matched:',
    remove: 'Remove from Saved',
  },
  ar: {
    title: 'المحفوظات',
    subtitle: 'ملفات قمت بحفظها لاحقاً',
    emptyTitle: 'لا توجد ملفات محفوظة',
    emptySub: 'اذهب إلى المطابقات واضغط “حفظ” على أي شخص.',
    why: 'لماذا تم التطابق:',
    remove: 'إزالة من المحفوظات',
  },
  he: {
    title: 'שמורים',
    subtitle: 'פרופילים ששמרת להמשך',
    emptyTitle: 'אין פרופילים שמורים',
    emptySub: 'חזרי/חזור להתאמות ולחצי “שמור” על מישהו שתרצי לזכור.',
    why: 'למה הותאמתם:',
    remove: 'הסר משמורים',
  },
}

const t = computed(() => TEXTS[lang.value] ?? TEXTS.en)
const isRtl = computed(() => lang.value === 'ar' || lang.value === 'he')

  // Helper for multilingual fields:
// If the backend returns an object (e.g., {en, he, ar}) we pick by current lang with fallbacks.
function pick(field) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[lang.value] || field.en || field.he || field.ar || ''
}

/* ===== Per participant keys ===== */
  // Current participant identifier used to scope localStorage keys (so saved list is per-user).
function participantId() {
  return String(route.params.id || '').trim()
}

  // localStorage key format: harmony_saved_<pid> (stores an array of saved match IDs).
function savedKey() {
  return `harmony_saved_${participantId()}`
}

  // Load saved IDs safely (JSON parse guarded) and return as a Set for fast lookup/filtering.
function loadSavedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(savedKey()) || '[]').map(String))
  } catch {
    return new Set()
  }
}

/* ===== Data ===== */
const allSavedMatches = ref([])
import defaultAvatar from '@/assets/default-avatar.png'
const placeholderAvatar = defaultAvatar


function normalizeResponse(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.matches)) return data.matches
  return []
}

  // Fetch all matches from backend, then filter to only the ones saved by this participant.
// This avoids duplicating match details in localStorage (we only store IDs).
async function fetchSavedMatches() {
  const pid = participantId()
  if (!pid) {
    allSavedMatches.value = []
    return
  }

  try {
    const res = await fetch(`/api/match/${pid}`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()

    const savedIds = loadSavedIds()
    const raw = normalizeResponse(data)

    allSavedMatches.value = raw
      .map(r => ({
        id: r?.id,
        name: r?.name ?? '',
        role: r?.role ?? '',
        whyMatched: r?.reason ?? '',
        avatar: r?.imageUrl || placeholderAvatar,
      }))
      .filter(m => savedIds.has(String(m.id)))  // Keep only matches whose id exists in the saved IDs set.

  } catch {
    allSavedMatches.value = []
  }
}

onMounted(fetchSavedMatches)
watch(() => route.params.id, () => fetchSavedMatches())

const savedMatches = computed(() => allSavedMatches.value)

  // Remove a match from Saved:
// - update localStorage saved IDs
// - update UI list immediately (optimistic update) without refetching from backend
function unsave(m) {
  const ids = loadSavedIds()
  ids.delete(String(m.id))
  localStorage.setItem(savedKey(), JSON.stringify([...ids]))
  allSavedMatches.value = allSavedMatches.value.filter(x => String(x.id) !== String(m.id))
}
</script>


<style scoped>
.container { width: 100%; padding: 0; margin: 0; }

.shell {
  min-height: 100vh;
  padding: 18px 16px 70px;
  font-family: Arial, sans-serif;
  color: var(--h-text);

  background: linear-gradient(
    180deg,
    #e6f2ec 0%,
    #d6e8df 55%,
    #c8ded3 100%
  );

  position: relative;
  overflow: hidden;
}


/* blobs */
.blob { position:absolute; filter: blur(18px); opacity:.55; border-radius:999px; pointer-events:none; }
.blob1 { width:360px; height:360px; left:-140px; top:-140px;
  background: radial-gradient(circle at 30% 30%, rgba(63,127,99,0.45), rgba(63,127,99,0.08));}
.blob2 { width:460px; height:460px; right:-210px; top:50px;
  background: radial-gradient(circle at 40% 40%, rgba(47,107,79,0.30), rgba(233,243,238,0.14));}
.blob3 { width:420px; height:420px; left:50%; bottom:-250px; transform: translateX(-50%);
  background: radial-gradient(circle at 40% 40%, rgba(233,243,238,0.80), rgba(47,107,79,0.06));}

.page{ max-width: 980px; margin: 0 auto; }

.headerRow{
  display:flex; justify-content:space-between; align-items:flex-end;
  gap:14px; margin: 8px 0 18px;
}
.h1{ margin:0 0 6px; font-size:44px; letter-spacing:-0.8px; font-weight:900; color: var(--h-green-700); }
.subtitle{ margin:0; color: var(--h-text-muted); }

/* language */
.langBox{
  display:flex; align-items:center; gap:8px;
  padding: 10px 12px; border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.40));
  border: 1px solid var(--h-border);
  box-shadow: var(--h-shadow-soft);
  backdrop-filter: blur(10px);
}
.langIcon{ opacity:0.8; }
.langSelect{ border:none; outline:none; background:transparent; font-weight:800; color: var(--h-text); cursor:pointer; }

.list{ display:grid; gap: 12px; grid-template-columns: 1fr; }
@media (min-width: 900px){ .list{ grid-template-columns: 1fr 1fr; } }

.card{
  position:relative;
  border-radius: 18px;
  padding: 18px;
  overflow:hidden;

  background: var(--h-card-bg);
  border: 2.5px solid #2f6b4f;

  box-shadow: var(--h-shadow-soft);
  backdrop-filter: blur(10px);
}
.cardGlow{
  position:absolute; inset:-2px;
  background: radial-gradient(700px 240px at 15% 0%, rgba(63,127,99,0.16), transparent 60%);
  pointer-events:none;
}

.cardHeader{ display:flex; justify-content:space-between; align-items:flex-start; gap: 14px; }
.info{ min-width:0; }
.name{ font-size:22px; font-weight:900; margin-bottom:2px; color: var(--h-text); }
.role{ color: var(--h-text-muted); }

.avatar{
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.92);
  box-shadow: 0 14px 30px rgba(31,63,50,0.18), 0 0 0 3px rgba(207,227,216,0.70);
}

.why{
  margin: 12px 0 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(233,243,238,0.65);
  border: 1px solid var(--h-border);
  color: var(--h-text);
  font-size: 14px;
  line-height: 1.35;
}
.why strong{ color: var(--h-green-800); }

.actions{ display:flex; gap:8px; flex-wrap:wrap; }
.btn{
  padding: 10px 14px;
  border-radius: 12px;

  border: 2.5px solid #2f6b4f;
  background: rgba(233, 243, 238, 0.85);
  color: #1f3f32;

  font-weight: 800;
}
.btn:hover{
  border-color: #24513f;
  background: rgba(233, 243, 238, 1);
}
/* Skip – SAME as Save (green border + light green bg) */
.btnOutline{
  padding: 10px 14px;
  border-radius: 12px;

  border: 2.5px solid #2f6b4f;
  background: rgba(233, 243, 238, 0.85);
  color: #1f3f32;

  font-weight: 800;
}

.btnOutline:hover{
  border-color: #24513f;
  background: rgba(233, 243, 238, 1);
}


.empty{
  display:flex; gap:14px; align-items:center;
  padding: 18px; border-radius: 18px;

  background: var(--h-card-bg);
  border: 1px dashed var(--h-border-strong);

  box-shadow: var(--h-shadow-soft);
  backdrop-filter: blur(10px);
}
.emptyIcon{
  width:44px; height:44px; border-radius:14px;
  display:grid; place-items:center;
  background: rgba(233,243,238,0.70);
  border: 1px solid var(--h-border);
  font-size: 18px;
}
.emptyTitle{ font-weight:900; color: var(--h-text); }
.emptySub{ margin-top:2px; color: var(--h-text-muted); font-size:13px; }

.spacerBottom{ height: 10px; }

@media (max-width: 420px){
  .shell{ padding: 12px 10px 60px; }
  .h1{ font-size: 34px; }
  .card{ padding: 12px; border-radius: 16px; }
  .name{ font-size: 19px; }
  .avatar{ width: 86px; height: 86px; }
  .why{ padding: 10px 12px; font-size: 13px; border-radius: 12px; }
  .btn{ padding: 9px 12px; font-size: 13px; }
}
</style>
