<template>
  <div class="auth-page">
    <aside class="brand">
      <div class="brand-mark">
        <span class="logo">C</span>
        <span>CPSU Attendance</span>
      </div>

      <div class="brand-hero">
        <div class="viewfinder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        </div>
        <h2>Check in with a scan and a selfie.</h2>
        <p>
          Scan the event QR code, confirm it's you,
          and your attendance is recorded.
        </p>
      </div>

      <small>
        Central Philippines State University, College of Computer Studies
      </small>
    </aside>

    <main class="panel">
      <div class="auth">
        <h1>Welcome back</h1>
        <p class="sub">
          Log in to check in to events or monitor attendance.
        </p>

        <form @submit.prevent="login">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@cpsu.edu.ph"
              required
              :disabled="locked"
            >
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="locked"
            >
          </div>

          <p v-if="error" class="alert">
            {{ error }}
          </p>

          <p v-if="locked" class="alert">
            Too many failed attempts. Try again in {{ secondsLeft }} seconds.
          </p>

          <button
            type="submit"
            class="btn-primary"
            :disabled="locked || busy"
          >
            Log in
          </button>

          <p
            v-if="!locked && attempts > 0 && attempts < MAX_ATTEMPTS"
            class="note"
          >
            Attempt {{ attempts }} of {{ MAX_ATTEMPTS }}
          </p>
        </form>

        <p class="switch">
          New student?
          <button class="link" @click="$emit('register')">
            Create an account
          </button>
        </p>

        <div v-if="DEMO" class="demo">
          <p>Just exploring? Try a demo account:</p>
          <div class="demo-row">
            <button type="button" class="btn-ghost" @click="openDemoFace">
              Try as Student
            </button>
            <button type="button" class="btn-ghost" @click="demoAdmin">
              Try as Admin
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- DEMO STUDENT: FACE ENROLLMENT -->
    <div v-if="faceOpen" class="overlay">
      <div class="modal">
        <h2>Face enrollment</h2>
        <p class="sub">
          Take a photo of your face first. It will be your demo account's
          registered face, and check-in will verify against it.
        </p>

        <div class="face-box">
          <span v-if="!faceOn && !facePhoto" class="face-empty">Starting camera...</span>
          <img v-if="facePhoto" :src="facePhoto" alt="Captured face">
          <video v-show="faceOn && !facePhoto" ref="faceVideo" autoplay playsinline muted></video>
        </div>

        <p v-if="faceError" class="alert" style="margin-top: 12px">{{ faceError }}</p>

        <button
          v-if="!facePhoto"
          type="button"
          class="btn-primary"
          :disabled="!faceOn"
          @click="captureDemoFace"
        >
          Capture photo
        </button>

        <template v-else>
          <button type="button" class="btn-primary" @click="startDemoStudent">
            Continue as student
          </button>
          <button type="button" class="btn-ghost" @click="retakeDemoFace">
            Retake photo
          </button>
        </template>

        <button type="button" class="link cancel-link" @click="closeDemoFace">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { DEMO_MODE as DEMO } from '../utils/demodata'

const emit = defineEmits(['login', 'register'])

/* =========================
   SETTINGS
========================= */

const MAX_ATTEMPTS = 3
const LOCK_SECONDS = 30
const LOCK_KEY = 'loginLockUntil'

// Officer (admin) account for the prototype.
// Replace with real authentication once a backend exists.
const ADMIN_EMAIL = 'admin@cpsu.edu.ph'
const ADMIN_PASSWORD = 'admin123'

const DEMO_EMAIL = 'demo.student@cpsu.edu.ph'

/* =========================
   STATE
========================= */

const email = ref('')
const password = ref('')
const attempts = ref(0)
const error = ref('')
const busy = ref(false)

const lockedUntil = ref(Number(localStorage.getItem(LOCK_KEY) || 0))
const now = ref(Date.now())
let timer = null

const locked = computed(() => lockedUntil.value > now.value)

const secondsLeft = computed(() =>
  Math.max(0, Math.ceil((lockedUntil.value - now.value) / 1000))
)

/* =========================
   LOCKOUT
========================= */

function startTimer() {
  clearInterval(timer)

  timer = setInterval(() => {
    now.value = Date.now()

    if (now.value >= lockedUntil.value) {
      clearInterval(timer)
      localStorage.removeItem(LOCK_KEY)
      attempts.value = 0
      error.value = ''
    }
  }, 500)
}

function lockLogin() {
  lockedUntil.value = Date.now() + LOCK_SECONDS * 1000
  now.value = Date.now()
  localStorage.setItem(LOCK_KEY, String(lockedUntil.value))
  error.value = ''
  startTimer()
}

onMounted(() => {
  if (locked.value) {
    startTimer()
  }
})

onUnmounted(() => {
  clearInterval(timer)
  stopFaceCamera()
})

/* =========================
   PASSWORD HASH
   (must match Registration.vue)
========================= */

async function hashPassword(text) {
  if (!globalThis.crypto?.subtle) {
    return text
  }

  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  )

  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

/* =========================
   LOGIN
========================= */

async function login() {
  if (locked.value || busy.value) {
    return
  }

  busy.value = true

  const emailValue = email.value.trim().toLowerCase()

  // OFFICER ACCOUNT
  if (
    emailValue === ADMIN_EMAIL &&
    password.value === ADMIN_PASSWORD
  ) {
    attempts.value = 0
    error.value = ''
    busy.value = false

    emit('login', 'admin')
    return
  }

  // STUDENT ACCOUNTS
  const users = JSON.parse(
    localStorage.getItem('users') || '[]'
  )

  const user = users.find(item => item.email === emailValue)

  if (
    user &&
    user.passwordHash === await hashPassword(password.value)
  ) {
    attempts.value = 0
    error.value = ''

    // Current session (no password or face data kept here)
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: user.name,
        email: user.email,
        studentId: user.studentId
      })
    )

    busy.value = false

    emit('login', 'student')
    return
  }

  // INVALID LOGIN
  busy.value = false
  attempts.value++

  if (attempts.value >= MAX_ATTEMPTS) {
    lockLogin()
    return
  }

  error.value = 'Invalid email or password.'
}

/* =========================
   DEMO ACCOUNTS
========================= */

const faceOpen = ref(false)
const faceOn = ref(false)
const faceVideo = ref(null)
const facePhoto = ref('')
const faceError = ref('')
let faceStream = null

function demoAdmin() {
  emit('login', 'admin')
}

async function startFaceCamera() {
  faceError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    faceError.value =
      'Camera is not available. Open the system using https or localhost.'
    return
  }

  try {
    faceStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    })

    faceOn.value = true
    await nextTick()

    faceVideo.value.srcObject = faceStream
    await faceVideo.value.play()
  } catch {
    faceError.value =
      'Unable to access the camera. Please allow camera permission.'
  }
}

function stopFaceCamera() {
  faceStream?.getTracks().forEach(track => track.stop())
  faceStream = null
  faceOn.value = false
}

async function openDemoFace() {
  facePhoto.value = ''
  faceOpen.value = true
  await nextTick()
  startFaceCamera()
}

function captureDemoFace() {
  const el = faceVideo.value

  if (!el || !el.videoWidth) {
    faceError.value = 'Camera is not ready yet. Please try again.'
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 360

  canvas
    .getContext('2d')
    .drawImage(el, 0, 0, canvas.width, canvas.height)

  facePhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  stopFaceCamera()
}

function retakeDemoFace() {
  facePhoto.value = ''
  startFaceCamera()
}

function closeDemoFace() {
  stopFaceCamera()
  faceOpen.value = false
  facePhoto.value = ''
}

function startDemoStudent() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
    .filter(item => item.email !== DEMO_EMAIL)

  users.push({
    name: 'Demo Student',
    studentId: 'DEMO-0001',
    email: DEMO_EMAIL,
    passwordHash: '', // demo account cannot log in with a password
    faceImage: facePhoto.value,
    registeredAt: Date.now()
  })

  localStorage.setItem('users', JSON.stringify(users))

  const students = JSON.parse(localStorage.getItem('students') || '[]')
    .filter(item => item.email !== DEMO_EMAIL)

  students.push({
    name: 'Demo Student',
    studentId: 'DEMO-0001',
    email: DEMO_EMAIL,
    faceEnrolled: true
  })

  localStorage.setItem('students', JSON.stringify(students))

  localStorage.setItem(
    'user',
    JSON.stringify({
      name: 'Demo Student',
      email: DEMO_EMAIL,
      studentId: 'DEMO-0001'
    })
  )

  stopFaceCamera()
  faceOpen.value = false

  emit('login', 'student')
}
</script>

<style scoped>
.auth-page {
  --forest: #0b3d2c;
  --forest-2: #145a40;
  --green: #0f7a4d;
  --green-dark: #0c6641;
  --leaf: #2fa36b;
  --mint: #e8f4ee;
  --mint-2: #cfe8db;
  --gold: #e8b931;
  --ink: #12261e;
  --muted: #5f7268;
  --line: #dfe9e3;
  --bg: #f3f7f4;
  --danger: #b42318;
  --danger-bg: #fdecea;
  --warn: #8a5a00;
  --warn-bg: #fdf3d6;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: var(--ink);
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(340px, 46%) 1fr;
  background: var(--bg);
}

.auth-page *,
.auth-page *::before,
.auth-page *::after {
  box-sizing: border-box;
}

/* ---------- brand side ---------- */

.brand {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px clamp(28px, 4vw, 56px);
  color: #fff;
  background: linear-gradient(160deg, var(--forest) 0%, var(--forest-2) 100%);
}

.brand::before {
  content: '';
  position: absolute;
  width: 620px;
  height: 620px;
  right: -260px;
  bottom: -240px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, .12);
  box-shadow:
    0 0 0 70px rgba(255, 255, 255, .03),
    0 0 0 140px rgba(255, 255, 255, .025);
}

.brand > * {
  position: relative;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 17px;
}

.logo {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: var(--gold);
  color: var(--forest);
  font-weight: 800;
  font-size: 19px;
}

.viewfinder {
  --c: var(--gold);
  --t: 4px;
  --l: 34px;
  position: relative;
  width: 190px;
  height: 190px;
  margin-bottom: 34px;
  display: grid;
  place-items: center;
  background:
    linear-gradient(var(--c) 0 0) top left / var(--l) var(--t),
    linear-gradient(var(--c) 0 0) top left / var(--t) var(--l),
    linear-gradient(var(--c) 0 0) top right / var(--l) var(--t),
    linear-gradient(var(--c) 0 0) top right / var(--t) var(--l),
    linear-gradient(var(--c) 0 0) bottom left / var(--l) var(--t),
    linear-gradient(var(--c) 0 0) bottom left / var(--t) var(--l),
    linear-gradient(var(--c) 0 0) bottom right / var(--l) var(--t),
    linear-gradient(var(--c) 0 0) bottom right / var(--t) var(--l);
  background-repeat: no-repeat;
}

.viewfinder svg {
  width: 74px;
  height: 74px;
  color: #fff;
  stroke-width: 2.4;
}

.brand-hero h2 {
  margin: 0 0 12px;
  max-width: 400px;
  font-size: clamp(28px, 3.2vw, 38px);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -.02em;
}

.brand-hero p {
  margin: 0;
  max-width: 380px;
  font-size: 16px;
  line-height: 1.55;
  color: rgba(255, 255, 255, .78);
}

.brand small {
  font-size: 13px;
  color: rgba(255, 255, 255, .6);
}

/* ---------- form side ---------- */

.panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.auth {
  width: 100%;
  max-width: 410px;
}

.auth h1 {
  margin: 0 0 6px;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -.02em;
}

.sub {
  margin: 0 0 26px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.5;
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  text-align: left;
}

.field label {
  font-size: 13px;
  font-weight: 600;
}

.field input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 15px;
  transition: border-color .15s, box-shadow .15s;
}

.field input::placeholder {
  color: #9baba3;
}

.field input:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 4px rgba(15, 122, 77, .15);
}

.field input:disabled {
  background: #eef3f0;
  cursor: not-allowed;
}

.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-primary {
  width: 100%;
  height: 48px;
  margin-top: 6px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: var(--green);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--green-dark);
}

.btn-primary:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.alert {
  margin: 0 0 14px;
  padding: 11px 14px;
  border-radius: 10px;
  background: var(--danger-bg);
  color: var(--danger);
  font-size: 14px;
  font-weight: 500;
}

.note {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.switch {
  margin: 22px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.link {
  width: auto;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--green);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

/* ---------- face enrollment ---------- */

.face-card {
  margin: 6px 0 16px;
  padding: 16px;
  border: 1.5px dashed var(--mint-2);
  border-radius: 14px;
  background: var(--mint);
}

.face-head strong {
  display: block;
  font-size: 14px;
}

.face-head span {
  display: block;
  margin: 2px 0 12px;
  font-size: 13px;
  color: var(--muted);
}

.face-box {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: var(--forest);
  display: grid;
  place-items: center;
}

.face-box img,
.face-box video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-box video {
  transform: scaleX(-1);
}

/* show the captured photo mirrored, like the live preview */
.face-box img {
  transform: scaleX(-1);
}

.face-empty {
  font-size: 13px;
  color: rgba(255, 255, 255, .6);
}

.btn-ghost {
  width: 100%;
  height: 42px;
  margin-top: 10px;
  border: 1.5px solid var(--green);
  border-radius: 10px;
  background: #fff;
  color: var(--green);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-ghost:hover {
  background: var(--mint);
}

/* ---------- demo accounts ---------- */

.demo {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  text-align: center;
}

.demo p {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--muted);
}

.demo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.demo-row .btn-ghost {
  margin-top: 0;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(11, 61, 44, .6);
}

.modal {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

.modal h2 {
  margin: 0 0 6px;
  font-size: 22px;
}

.modal .sub {
  margin-bottom: 16px;
}

.cancel-link {
  display: block;
  margin: 14px auto 0;
  color: var(--muted);
}

/* ---------- small screens ---------- */

@media (max-width: 860px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .brand {
    padding: 18px 22px;
  }

  .brand-hero,
  .brand small {
    display: none;
  }

  .panel {
    align-items: flex-start;
    padding: 28px 20px 40px;
  }
}

@media (max-width: 420px) {
  .row2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .panel {
    padding: 22px 16px 36px;
  }

  .auth h1 {
    font-size: 26px;
  }

  .brand {
    padding: 14px 16px;
  }
}

@media (min-width: 861px) and (max-height: 700px) {
  .viewfinder {
    width: 130px;
    height: 130px;
    margin-bottom: 20px;
  }

  .brand {
    padding-top: 28px;
    padding-bottom: 28px;
  }
}
</style>

<style>
/* Makes the app fill the whole browser window
   (overrides the default Vite page styles that shrink it). */
html,
body {
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
}

body {
  display: block !important;
  place-items: initial !important;
  min-width: 320px;
}

#app {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  text-align: left !important;
  display: block !important;
  grid-template-columns: none !important;
  place-items: initial !important;
}
</style>