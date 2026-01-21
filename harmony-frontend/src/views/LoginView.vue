
<template>
  <div class="container">

    <!-- Login page wrapper:
     Uses :dir to switch between RTL (he/ar) and LTR (en) layouts -->
    <div class="loginPage" :dir="isRtl ? 'rtl' : 'ltr'">
      <div class="loginCard">
        <!-- BRAND -->
        <div class="brand">
          <img class="brandLogo" src="@/assets/harmony-logo.png" alt="Harmony" />
          <h1 class="title">Harmony</h1>
        </div>

        <p class="subtitle">{{ t.subtitle }}</p>

        <!-- Language selector:
     Saves user preference to localStorage to persist across refreshes -->
        <label class="label">{{ t.language }}</label>
        <div class="field">
          <select class="input selectInput" v-model="lang">
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="he">Hebrew</option>
          </select>
          <span class="arrow">▾</span>
        </div>

        <!-- Participant identifier input:
     Input is numeric-only (inputmode="numeric") and validated before enabling Continue -->
        <label class="label">{{ t.phone }}</label>
        <div class="field">
          <input
            v-model="phone"
            class="input phoneInput ltrNum"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            :placeholder="t.phonePlaceholder"
            @input="onPhoneInput"
            @keyup.enter="continueLogin"
          />
        </div>

        <p v-if="phoneTouched && phone.trim() && !isIdValid" class="errorText">
          {{ t.phoneError }}
        </p>

        <!-- BUTTONS -->
        <!-- Actions:
     Continue -> go to Matches with pid
     New participant -> go directly to Profile flow with pid -->
        <div class="btnBar">
          <button type="button" class="primaryBtn" :disabled="!isIdValid" @click="continueLogin">
            {{ t.continue }}
          </button>

          <button type="button" class="secondaryBtn" @click="newParticipant">
            {{ t.newParticipant }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

/**
 * LoginView.vue
 * Purpose: Entry screen for the Harmony app (participant login).
 * Key features:
 *  - Multi-language UI (EN/HE/AR) with RTL support.
 *  - Validates participant id input and persists it for routing.
 *  - Stores session state in a small global store + localStorage for refresh support.
 * Design choice: pid is saved in localStorage and used by the router to prevent broken routes.
 */
<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/store/authStore'

// Vue Router is used for programmatic navigation after login.
const router = useRouter()

// We keep the variable name "phone" for backward compatibility with the UI/CSS,
// but it represents the participant id used for routing and backend requests.
const phone = ref('')
const phoneTouched = ref(false)

  // Persist language preference so the UI keeps the same language after reload.
const LANG_KEY = 'harmony_lang'
const lang = ref(localStorage.getItem(LANG_KEY) || 'en')
watch(lang, v => localStorage.setItem(LANG_KEY, v), { immediate: true })

  // In-component translation dictionary for a small number of UI strings.
// (Avoids adding a full i18n library for this prototype.)
const TEXTS = {
  en: {
    language: 'Language',
    phone: 'Participant Phone Number',
    phonePlaceholder: '',
    phoneError: 'Please enter a valid numeric ID (e.g. 15).',
    continue: 'Continue',
    newParticipant: 'New participant',
  },
  ar: {
    language: 'اللغة',
    phone: 'رقم الهاتف',
    phonePlaceholder: '',
    continue: 'متابعة',
    newParticipant: 'مشارك جديد',
  },
  he: {
    subtitle: 'הקלד/י מזהה משתתף (ID)',
    language: 'שפה',
    phone: 'מספר טלפון',
    phonePlaceholder: '',
    continue: 'המשך',
    newParticipant: 'משתתף חדש',
  },
}

const t = computed(() => TEXTS[lang.value] ?? TEXTS.en)
  
  // RTL layout for Hebrew/Arabic to ensure correct reading direction and alignment.
const isRtl = computed(() => lang.value === 'ar' || lang.value === 'he')

// Normalization step:
// Extract digits only to avoid issues with spaces or non-numeric characters.
// This makes input robust for real users on mobile keyboards.
function normalizeId(raw) {
  const s = (raw || '').trim()
  const digitsOnly = s.replace(/[^\d]/g, '')
  return digitsOnly
}

  // Validation rule:
// Accepts numeric ids (including ids that may start with 0).
// The Continue button stays disabled until the input is valid.
function isValidId(raw) {
  const id = normalizeId(raw)
  return /^\d+$/.test(id)
}


const isIdValid = computed(() => isValidId(phone.value))

function onPhoneInput() {
  phoneTouched.value = true
}

  // Main login flow:
// 1) Validate id
// 2) Save to authStore (reactive state)
// 3) Save to localStorage ("harmony_pid") so routing survives refresh
// 4) Navigate to Matches page with pid in the URL
function continueLogin() {
  if (!isIdValid.value) return
  const id = normalizeId(phone.value)

  authStore.phone = id
  authStore.isLoggedIn = true

  localStorage.setItem('harmony_pid', id)

  router.push(`/matches/${id}`)
}

// New participant flow:
// Skips Matches and navigates directly to Profile creation/view for the given id.
function newParticipant() {
  const id = normalizeId(phone.value)
  if (!id) return

  authStore.phone = id
  authStore.isLoggedIn = true
  localStorage.setItem('harmony_pid', id)

  router.push(`/profile/${id}`)
}


</script>

/* Styling notes:
   - Green "glass" card matches Harmony branding (logo colors).
   - Sticky button bar keeps actions visible on small screens.
   - Responsive tweaks for mobile ensure the login card fits without overflow. */
<style scoped>
.container { width: 100%; max-width: none; padding: 0; margin: 0; }

/* ===== PAGE BG  */
.loginPage{
  min-height: 100svh;
  display: grid;
  place-items: center;
  width: 100%;
  padding: 18px;
  font-family: Arial, sans-serif;
  color: var(--h-text);

  background: linear-gradient(
    180deg,
    #e6f2ec 0%,
    #d6e8df 55%,
    #c8ded3 100%
  );
}

/* CARD  */
.loginCard{
  width: min(520px, 92vw);
  padding: 26px 22px;
  border-radius: 26px;

  /* glass  */
  background: linear-gradient(
    180deg,
    rgba(233,243,238,0.92),
    rgba(255,255,255,0.80)
  );

  
  border: 2.5px solid #2f6b4f;

  box-shadow:
    0 20px 45px rgba(31,63,50,0.15),
    0 0 0 6px rgba(207,227,216,0.40);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  display: flex;
  flex-direction: column;
  gap: 14px;

  max-height: calc(100svh - 36px);
  overflow: auto;
  scroll-padding-bottom: 140px;
}

/* ===== BRAND ===== */
.brand{ display:flex; align-items:center; justify-content:center; gap:12px; }
.brandLogo{
  height: 54px;
  width: 54px;
  object-fit: cover;
  border-radius: 50%;
}
.title{ font-size: 44px; font-weight: 900; color: #1f3f32; margin: 0; }
.subtitle{ text-align:center; font-size:14px; color: var(--h-text-muted); }

/* ===== FORM ===== */
.label{ font-size: 13px; font-weight: 900; color: var(--h-text); }

.input{
  width: 100%;
  padding: 14px 44px 14px 14px;
  border-radius: 16px;
  height: 52px;
  box-sizing: border-box;

  
  border: 2px solid rgba(47,107,79,0.25);
  background: rgba(255,255,255,0.94);
  color: var(--h-text);

  font-size: 14px;
  box-shadow: 0 10px 22px rgba(31,63,50,0.08);
}

.input:focus{
  outline: none;
  border-color: #2f6b4f;
  box-shadow: 0 0 0 4px rgba(47,107,79,0.18), 0 12px 26px rgba(31,63,50,0.10);
}
.field{
  width: 100%;
}

.selectInput{
  padding-right: 44px; 
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.arrow{
  pointer-events: none;
  right: 16px;
}


.arrow{ position:absolute; right:16px; top:50%; transform: translateY(-50%); opacity: 0.6; }
.ltrNum{ direction:ltr; unicode-bidi: plaintext; }

.errorText{
  margin: -6px 0 4px;
  font-size: 12.5px;
  color: rgba(170, 50, 50, 0.95);
  text-align: center;
}

/* ===== BUTTONS BAR ===== */
  /* Sticky action bar:
   Keeps Continue/New Participant buttons accessible even when content scrolls */
.btnBar{
  position: sticky;
  bottom: 0;
  padding-top: 12px;
  display: grid;
  gap: 12px;

  margin-left: -22px;
  margin-right: -22px;
  padding-left: 22px;
  padding-right: 22px;

  border-bottom-left-radius: 26px;
  border-bottom-right-radius: 26px;

  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(233,243,238,0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* BUTTONS */
.primaryBtn,
.secondaryBtn{
  width: 100%;
  min-height: 54px;
  border-radius: 18px;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;

  border: 2.5px solid #2f6b4f;
  color: #1f3f32;

  box-shadow: 0 14px 30px rgba(31,63,50,0.12);
  transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
}

.primaryBtn{
  /* Continue */
  background: linear-gradient(135deg, rgba(233,243,238,0.98), rgba(206,232,221,0.98));
}

.secondaryBtn{
  /* New participant */
  background: rgba(233,243,238,0.88);
}

.primaryBtn:hover,
.secondaryBtn:hover{
  transform: translateY(-1px);
  border-color: #24513f;
  background: rgba(233,243,238,1);
}

.primaryBtn:disabled{
  background: rgba(233,243,238,0.55);
  border-color: rgba(47,107,79,0.28);
  color: rgba(31,63,50,0.55);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* ===== MOBILE ===== */
@media (max-width: 420px){
  .loginPage{ padding: 12px; }
  .loginCard{
    width: 94vw;
    padding: 16px 14px;
    border-radius: 18px;
    gap: 10px;
  }
  .title{ font-size: 34px; }
  .brandLogo{ height: 44px; width:44px; }

  .primaryBtn, .secondaryBtn{ min-height: 50px; font-size: 15px; }

  .btnBar{
    margin-left: -14px;
    margin-right: -14px;
    padding-left: 14px;
    padding-right: 14px;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
  }
}
</style>
