<template>
  <div class="container">
    <div class="shell" :dir="isRtl ? 'rtl' : 'ltr'">
      <!-- background decorations -->
      <div class="blob blob1" aria-hidden="true"></div>
      <div class="blob blob2" aria-hidden="true"></div>
      <div class="blob blob3" aria-hidden="true"></div>

      <div class="page">
        <!-- אם TopNav אצלך תקין, תשאירי. אם זה גורם לקריסה, תמחקי את השורה הזו -->
        <TopNav :lang="lang" />

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

        <!-- LOADING / ERROR -->
        <div v-if="loading" class="empty">
          <div class="emptyIcon" aria-hidden="true">⏳</div>
          <div class="emptyText">
            <div class="emptyTitle">{{ t.loadingTitle }}</div>
            <div class="emptySub">{{ t.loadingSub }}</div>
          </div>
        </div>

        <div v-else-if="errorMsg" class="empty">
          <div class="emptyIcon" aria-hidden="true">⚠️</div>
          <div class="emptyText">
            <div class="emptyTitle">{{ t.errorTitle }}</div>
            <div class="emptySub">{{ errorMsg }}</div>
          </div>
        </div>

        <!-- EMPTY -->
        <div v-else-if="sortedMatches.length === 0" class="empty">
          <div class="emptyIcon" aria-hidden="true">✨</div>
          <div class="emptyText">
            <div class="emptyTitle">{{ t.emptyTitle }}</div>
            <div class="emptySub">{{ t.emptySub }}</div>
          </div>
        </div>

        <!-- LIST -->
        <div v-else class="list">
          <div
            v-for="(m, idx) in sortedMatches"
            :key="m.id"
            class="card"
            :class="{ topMatch: idx === 0 }"
          >
            <div class="cardGlow" aria-hidden="true"></div>

            <div v-if="idx === 0" class="bestBadge">
              {{ t.bestMatch }}
            </div>

            <div class="cardHeader">
              <div class="info">
                <div class="name">{{ m.name }}</div>
                <div class="role">{{ m.role }}</div>

                <div class="matchPercent ltrNum">
                  {{ m.matchPercent }}% {{ t.matchSuffix }}
                </div>
              </div>

<img class="avatar" :src="m.avatar" alt="avatar" loading="lazy" @error="onAvatarError" />
            </div>

            <div class="why">
              <strong>{{ t.why }}</strong>
              {{ m.whyMatched }}
            </div>

            <div class="status">
              <span v-if="m.saved">{{ t.saved }}</span>
              <span v-if="m.met">{{ t.met }}</span>
            </div>

            <div class="actions">
              <button class="btn" @click="save(m)">
                {{ m.saved ? t.unsave : t.save }}
              </button>

              <button class="btn btnDark" @click="markMet(m)">
                {{ m.met ? t.unmetBtn : t.metBtn }}
              </button>

              <button class="btn btnOutline" @click="skip(m)">
                {{ t.skip }}
              </button>
            </div>
          </div>

          <div class="refreshRow">
            <button class="btn" @click="fetchMatches()">{{ t.refresh }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/components/TopNav.vue'

const route = useRoute()

/* ===== Language ===== */
const LANG_KEY = 'harmony_lang'
const lang = ref(localStorage.getItem(LANG_KEY) || 'en')
watch(lang, v => localStorage.setItem(LANG_KEY, v), { immediate: true })

const TEXTS = {
  en: {
    title: 'Matches',
    subtitle: 'People you may want to meet',
    emptyTitle: 'No more matches',
    emptySub: 'Try again later or come back after new participants join.',
    loadingTitle: 'Loading matches…',
    loadingSub: 'Please wait a moment.',
    errorTitle: 'Could not load matches',
    why: 'Why matched:',
    saved: '⭐ Saved',
    met: '🤝 Met',
    save: 'Save',
    unsave: 'Unsave',
    metBtn: 'Met',
    unmetBtn: 'Unmet',
    skip: 'Skip',
    matchSuffix: 'match',
    bestMatch: '⭐ BEST MATCH',
    refresh: 'Refresh',
  },
  ar: {
    title: 'المطابقات',
    subtitle: 'أشخاص قد ترغب بلقائهم',
    emptyTitle: 'لا توجد مطابقات أخرى',
    emptySub: 'جرّب لاحقاً أو عد بعد انضمام مشاركين جدد.',
    loadingTitle: 'جارٍ تحميل المطابقات…',
    loadingSub: 'انتظر لحظة من فضلك.',
    errorTitle: 'تعذّر تحميل المطابقات',
    why: 'لماذا تم التطابق:',
    saved: '⭐ محفوظ',
    met: '🤝 تم اللقاء',
    save: 'حفظ',
    unsave: 'إلغاء الحفظ',
    metBtn: 'تم اللقاء',
    unmetBtn: 'إلغاء تم اللقاء',
    skip: 'تخطي',
    matchSuffix: 'تطابق',
    bestMatch: '⭐ أفضل تطابق',
    refresh: 'تحديث',
  },
  he: {
    title: 'התאמות',
    subtitle: 'אנשים שאולי תרצי/תרצה לפגוש',
    emptyTitle: 'אין עוד התאמות',
    emptySub: 'נסי/נסה שוב מאוחר יותר או חזרי/חזור כשמצטרפים משתתפים חדשים.',
    loadingTitle: 'טוען התאמות…',
    loadingSub: 'רק רגע.',
    errorTitle: 'לא הצלחנו לטעון התאמות',
    why: 'למה הותאמתם:',
    saved: '⭐ נשמר',
    met: '🤝 נפגשנו',
    save: 'שמור',
    unsave: 'בטל שמירה',
    metBtn: 'נפגשנו',
    unmetBtn: 'בטל נפגשנו',
    skip: 'דלג',
    matchSuffix: 'התאמה',
    bestMatch: '⭐ ההתאמה הטובה ביותר',
    refresh: 'רענן',
  },
}

const t = computed(() => TEXTS[lang.value] ?? TEXTS.en)
const isRtl = computed(() => lang.value === 'ar' || lang.value === 'he')

/* ===== Data ===== */
const loading = ref(false)
const errorMsg = ref('')
const matches = ref([])

import defaultAvatar from '@/assets/default-avatar.png'
const placeholderAvatar = defaultAvatar


function participantId() {
  return String(route.params.id || '').trim()
}
function savedKey() {
  return `harmony_saved_${participantId()}`
}
function metKey() {
  return `harmony_met_${participantId()}`
}

function loadSet(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
    return new Set(arr.map(String))
  } catch {
    return new Set()
  }
}

function saveSet(key, setObj) {
  localStorage.setItem(key, JSON.stringify([...setObj]))
}

function applySavedMetFlags(list) {
  const saved = loadSet(savedKey())
  const met = loadSet(metKey())

  return list.map(x => ({
    ...x,
    saved: saved.has(String(x.id)),
    met: met.has(String(x.id)),
  }))
}


function normalizeResponse(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.matches)) return data.matches
  return []
}

function toUiMatch(raw) {
  const score = Number(raw?.score)
  const matchPercent = Number.isFinite(score) ? Math.round(score * 100) : 0

  return {
    id: raw?.id ?? Math.random().toString(16).slice(2),
    name: raw?.name ?? '',
    role: '', // לא מגיע מה-API כרגע
    matchPercent,
    whyMatched: raw?.reason ?? '',
    avatar: (raw?.imageUrl && String(raw.imageUrl).trim()) ? raw.imageUrl : placeholderAvatar,

    saved: false,
    met: false,
  }
}

async function fetchMatches() {
  const pid = participantId()
  if (!pid) return

  loading.value = true
  errorMsg.value = ''

  try {
    // ✅ עם proxy:
    const res = await fetch(`/api/match/${pid}`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()

    const rawMatches = normalizeResponse(data)
    matches.value = rawMatches.map(toUiMatch)
  } catch (e) {
    errorMsg.value = e?.message || 'Failed to fetch'
    matches.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchMatches)

watch(
  () => route.params.id,
  () => fetchMatches()
)

const sortedMatches = computed(() =>
  [...matches.value].sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0))
)

function save(m) {
  const key = savedKey()
  const setObj = loadSet(key)
  const id = String(m.id)

  if (setObj.has(id)) {
    setObj.delete(id)
    m.saved = false
  } else {
    setObj.add(id)
    m.saved = true
  }
  saveSet(key, setObj)
}

function markMet(m) {
  const key = metKey()
  const setObj = loadSet(key)
  const id = String(m.id)

  if (setObj.has(id)) {
    setObj.delete(id)
    m.met = false
  } else {
    setObj.add(id)
    m.met = true
  }
  saveSet(key, setObj)
}


function skip(m) {
  matches.value = matches.value.filter(x => x.id !== m.id)
}

function onAvatarError(e) {
  e.target.src = placeholderAvatar
}
</script>

<style scoped>
/* זה ה-CSS שלך 그대로 (רק הוספתי refreshRow). */
.container { width: 100%; padding: 0; margin: 0; }

.shell {
  min-height: 100vh;
  padding: 18px 16px 70px;
  font-family: Arial, sans-serif;
  color: var(--h-text);
  background: linear-gradient(180deg, #e6f2ec 0%, #d6e8df 55%, #c8ded3 100%);
  position: relative;
  overflow: hidden;
}

.blob { position:absolute; filter: blur(18px); opacity:.55; border-radius:999px; pointer-events:none; }
.blob1 { width:360px; height:360px; left:-140px; top:-140px;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--h-page-bg-mid) 55%, transparent), rgba(63,127,99,0.08));}
.blob2 { width:460px; height:460px; right:-210px; top:50px;
  background: radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--h-page-bg-start) 35%, transparent), rgba(233,243,238,0.14));}
.blob3 { width:420px; height:420px; left:50%; bottom:-250px; transform: translateX(-50%);
  background: radial-gradient(circle at 40% 40%, rgba(233,243,238,0.80), color-mix(in srgb, var(--h-page-bg-start) 6%, transparent));}

.page { max-width: 980px; margin: 0 auto; }

.headerRow { display:flex; justify-content:space-between; align-items:flex-end; gap:14px; margin: 8px 0 18px; }
.h1 { margin:0 0 6px; font-size:44px; letter-spacing:-0.8px; font-weight:900; color: var(--h-green-700); }
.subtitle { margin:0; color: var(--h-text-muted); }

.langBox {
  display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.40));
  border: 1px solid var(--h-border);
  box-shadow: var(--h-shadow-soft);
  backdrop-filter: blur(10px);
}

.list { display:grid; gap:12px; grid-template-columns:1fr; }
@media (min-width: 900px){ .list{ grid-template-columns: 1fr 1fr; } }

.card {
  position: relative; border-radius: 18px; padding: 16px; overflow: hidden;
  background: var(--h-card-bg); border: 2.5px solid #2f6b4f;
  box-shadow: var(--h-shadow-soft); backdrop-filter: blur(10px);
  transition:
   transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}
.card > * { position: relative; z-index: 1; }

.card:hover { transform: translateY(-2px); border-color:  #24513f; box-shadow: 0 18px 45px rgba(31, 63, 50, 0.16); }

.cardGlow{ position:absolute; inset:-2px; background: radial-gradient(700px 240px at 15% 0%, rgba(63,127,99,0.18), transparent 60%); pointer-events:none; }

/* ⭐ Best match: highlight the whole card */
.topMatch{
  border-color: #1e5a43;
  box-shadow: 0 22px 60px rgba(31,63,50,0.22);
}

.topMatch::before{
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 18px;
  pointer-events: none;

  /* glow + subtle fill on the whole card */
  background:
    radial-gradient(900px 320px at 20% 0%, rgba(79,154,120,0.18), transparent 60%),
    linear-gradient(180deg, rgba(233,243,238,0.35), rgba(233,243,238,0.08));
}


/* ⭐ BEST MATCH – sits on the top border of the whole card */
.bestBadge{
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);

  padding: 6px 18px;
  border-radius: 999px;

  background: linear-gradient(90deg, #2f6b4f, #4a8a6d);
  color: #ffffff;

  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.4px;

  border: 3px solid #2f6b4f;
  box-shadow: 0 10px 28px rgba(31,63,50,0.28);

  z-index: 3;
}

/* ⭐ RTL fix – center BEST MATCH correctly in Arabic/Hebrew */
:dir(rtl) .bestBadge{
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}


.cardHeader { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; }
.name { font-size:24px; font-weight:900; color: var(--h-text); margin-bottom:2px; }
.role { color: var(--h-text-muted); margin-bottom:10px; }

.matchPercent{
  display: inline-flex; align-items: center; gap: 8px; width: fit-content;
  padding: 6px 12px; border-radius: 999px;
  background: rgba(233, 243, 238, 0.85);
  border: 2px solid #2f6b4f;
  color: #1f3f32; font-weight: 900; font-size: 13px;
}
.ltrNum { direction:ltr; unicode-bidi: plaintext; }
.matchPercent::before{
  content:""; width:8px; height:8px; border-radius:999px;
  background: var(--h-green-600);
  box-shadow: 0 0 0 4px rgba(79,154,120,0.16);
}

.avatar{
  width:130px; height:130px; object-fit:cover;
  border: 3px solid rgba(255,255,255,0.90);
  border-radius: 50%;
  box-shadow: 0 14px 30px rgba(31,63,50,0.18), 0 0 0 3px rgba(207,227,216,0.70);
}

.why{
  margin: 12px 0; padding: 10px 12px; border-radius: 12px;
  background: var(--h-soft-2); border: 1px solid var(--h-border);
  font-size: 14px; line-height: 1.35;
}
.why strong{ color: var(--h-green-800); }

.status{ margin-bottom:12px; display:flex; gap:10px; flex-wrap:wrap; color: var(--h-text); }
.status span{
  background: rgba(233,243,238,0.60); border: 1px solid var(--h-border);
  padding:6px 10px; border-radius:999px; font-size:13px;
}

.actions{ display:flex; gap:8px; flex-wrap:wrap; }

.btn{
  padding: 10px 14px; border-radius: 12px;
  border: 2.5px solid #2f6b4f;
  background: rgba(233, 243, 238, 0.85);
  color: #1f3f32;
  font-weight: 800;
}
.btn:hover{ border-color: #24513f; background: rgba(233, 243, 238, 1); }

.btnDark{ font-weight: 900; letter-spacing: 0.3px; }
.btnOutline{ font-weight: 800; }

.empty{
  display:flex; gap:14px; align-items:center; padding: 18px; border-radius: 18px;
  background: var(--h-card-bg); border: 1px dashed var(--h-border-strong);
  box-shadow: var(--h-shadow-soft); backdrop-filter: blur(10px);
}
.emptyIcon{
  width:44px; height:44px; border-radius:14px; display:grid; place-items:center;
  background: var(--h-btn-bg); border: 1px solid var(--h-border); font-size: 18px;
}
.emptyTitle{ font-weight:900; color: var(--h-text); }
.emptySub{ margin-top:2px; color: var(--h-text-muted); font-size:13px; }

.refreshRow{ margin-top: 12px; display:flex; justify-content:center; }
</style>
