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
        <h1>Create your account</h1>
        <p class="sub">
          Register once, then check in to any event with a QR scan
          and face verification.
        </p>

        <form @submit.prevent="register">
          <div class="field">
            <label for="name">Full name</label>
            <input
              id="name"
              v-model="name"
              placeholder="Juan Dela Cruz"
              required
            >
          </div>

          <div class="row2">
            <div class="field">
              <label for="sid">Student ID</label>
              <input
                id="sid"
                v-model="studentId"
                placeholder="Student ID number"
                required
              >
            </div>

            <div class="field">
              <label for="reg-email">Email</label>
              <input
                id="reg-email"
                v-model="email"
                type="email"
                placeholder="you@cpsu.edu.ph"
                required
              >
            </div>
          </div>

          <div class="row2">
            <div class="field">
              <label for="reg-pass">Password</label>
              <input
                id="reg-pass"
                v-model="password"
                type="password"
                placeholder="At least 6 characters"
                minlength="6"
                required
              >
            </div>

            <div class="field">
              <label for="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                v-model="confirmPassword"
                type="password"
                placeholder="Repeat password"
                required
              >
            </div>
          </div>

          <!-- FACE ENROLLMENT -->
          <div class="face-card">
            <div class="face-head">
              <strong>Face enrollment</strong>
              <span>Your photo is used to confirm it's you when you check in.</span>
            </div>

            <div class="face-box">
              <span
                v-if="!cameraOn && !faceImage"
                class="face-empty"
              >
                No photo yet
              </span>

              <img
                v-if="faceImage"
                :src="faceImage"
                alt="Enrolled face"
              >

              <video
                v-show="cameraOn && !faceImage"
                ref="video"
                autoplay
                playsinline
                muted
              ></video>
            </div>

            <button
              v-if="!cameraOn && !faceImage"
              type="button"
              class="btn-ghost"
              @click="startCamera"
            >
              Open camera
            </button>

            <button
              v-if="cameraOn && !faceImage"
              type="button"
              class="btn-ghost"
              @click="captureFace"
            >
              Capture photo
            </button>

            <button
              v-if="faceImage"
              type="button"
              class="btn-ghost"
              @click="retake"
            >
              Retake photo
            </button>
          </div>

          <p v-if="error" class="alert">
            {{ error }}
          </p>

          <button
            type="submit"
            class="btn-primary"
            :disabled="busy"
          >
            Create account
          </button>
        </form>

        <p class="switch">
          Already registered?
          <button class="link" @click="$emit('login')">
            Log in
          </button>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted } from 'vue'

const name = ref('')
const studentId = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const busy = ref(false)

const video = ref(null)
const cameraOn = ref(false)
const faceImage = ref('')

let stream = null

const emit = defineEmits(['register', 'login'])

/* =========================
   CAMERA / FACE ENROLLMENT
========================= */

async function startCamera() {
  error.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    error.value =
      'Camera is not available. Open the system using https or localhost.'
    return
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    })

    cameraOn.value = true

    await nextTick()

    video.value.srcObject = stream
    await video.value.play()
  } catch {
    error.value =
      'Unable to access the camera. Please allow camera permission.'
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }

  cameraOn.value = false
}

function captureFace() {
  const el = video.value

  if (!el || !el.videoWidth) {
    error.value = 'Camera is not ready yet. Please try again.'
    return
  }

  // Keep the camera's real proportions (phones are tall), so the face isn't squashed.
  // Max 640px keeps the JPEG small enough for localStorage.
  const scale = Math.min(1, 640 / Math.max(el.videoWidth, el.videoHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(el.videoWidth * scale)
  canvas.height = Math.round(el.videoHeight * scale)

  canvas.getContext('2d').drawImage(el, 0, 0, canvas.width, canvas.height)

  faceImage.value = canvas.toDataURL('image/jpeg', 0.85)

  error.value = ''

  stopCamera()
}

function retake() {
  faceImage.value = ''
  startCamera()
}

onUnmounted(stopCamera)

/* =========================
   PASSWORD HASH
   (must match Login.vue)
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
   REGISTER
========================= */

async function register() {
  const emailValue = email.value.trim().toLowerCase()
  const idValue = studentId.value.trim()

  /* CHECK PASSWORD */

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  /* CHECK FACE ENROLLMENT */

  if (!faceImage.value) {
    error.value =
      'Please capture your face photo to complete registration.'
    return
  }

  /* CHECK EXISTING USERS */

  const users = JSON.parse(
    localStorage.getItem('users') || '[]'
  )

  if (users.some(user => user.email === emailValue)) {
    error.value = 'An account with this email already exists.'
    return
  }

  if (users.some(user => user.studentId === idValue)) {
    error.value = 'This Student ID is already registered.'
    return
  }

  busy.value = true

  /* SAVE ACCOUNT */

  users.push({
    name: name.value.trim(),
    studentId: idValue,
    email: emailValue,
    passwordHash: await hashPassword(password.value),
    faceImage: faceImage.value,
    registeredAt: Date.now()
  })

  localStorage.setItem('users', JSON.stringify(users))

  /* SAVE TO STUDENTS LIST (shown in the Officer dashboard) */

  const students = JSON.parse(
    localStorage.getItem('students') || '[]'
  )

  students.push({
    name: name.value.trim(),
    studentId: idValue,
    email: emailValue,
    faceEnrolled: true
  })

  localStorage.setItem('students', JSON.stringify(students))

  /* START SESSION (App.vue opens the dashboard right after registering) */

  localStorage.setItem(
    'user',
    JSON.stringify({
      name: name.value.trim(),
      email: emailValue,
      studentId: idValue
    })
  )

  /* FINISH */

  busy.value = false
  error.value = ''

  emit('register')
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