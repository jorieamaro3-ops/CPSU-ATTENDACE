<template>
  <div class="dashboard">

    <!-- Header -->
    <header class="topbar">
      <div class="brand">
        <span class="logo">C</span>
        <div>
          <strong>CPSU Attendance</strong>
          <small>Student portal</small>
        </div>
      </div>

      <div class="user">
        <div class="avatar">{{ initials }}</div>

        <div class="user-text">
          <strong>{{ user?.name || 'Student' }}</strong>
          <small v-if="user?.studentId">{{ user.studentId }}</small>
        </div>

        <button class="logout" @click="$emit('logout')">
          Logout
        </button>
      </div>
    </header>

    <main>

      <!-- Greeting -->
      <section class="hero">
        <h1>Hello, {{ firstName }}</h1>

        <p v-if="events.length">
          You have checked in to {{ checkedInCount }} of
          {{ events.length }} {{ events.length === 1 ? 'event' : 'events' }}.
        </p>

        <p v-else>
          Events created by your Officer will show up here.
        </p>

        <div v-if="events.length" class="progress">
          <span :style="{ width: progress + '%' }"></span>
        </div>
      </section>

      <h2 class="section-title">Events</h2>

      <!-- Events -->
      <section v-if="events.length" class="events">
        <article
          v-for="event in events"
          :key="event.id"
          class="event-row"
        >
          <div class="date-chip">
            <span>{{ monthOf(event.date) }}</span>
            <strong>{{ dayOf(event.date) }}</strong>
          </div>

          <div class="event-body">
            <h3>{{ event.name }}</h3>

            <p class="meta">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> {{ formatTime(event.time) }}</span>
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> {{ event.location }}</span>
            </p>
          </div>

          <button
            v-if="hasCheckedIn(event)"
            class="btn done"
            disabled
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Checked in
          </button>

          <button
            v-else
            class="btn checkin"
            @click="startCheckIn(event)"
          >
            Check in
          </button>
        </article>
      </section>

      <!-- No events -->
      <div v-else class="no-events">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
        <h3>No events yet</h3>
        <p>
          When an Officer creates an event, it will appear here
          so you can check in.
        </p>
      </div>

    </main>

    <!-- Check-in Modal -->
    <div
      v-if="step"
      class="overlay"
    >

      <div class="modal">

        <ol class="steps">
          <li :class="{ active: step === 'qr', done: step !== 'qr' }">
            <span>1</span> Scan QR
          </li>
          <li :class="{ active: step === 'face', done: step === 'success' }">
            <span>2</span> Verify face
          </li>
          <li :class="{ active: step === 'success' }">
            <span>3</span> Done
          </li>
        </ol>

        <!-- STEP 1: QR -->
        <div v-if="step === 'qr'">

          <h2>Scan the event QR code</h2>

          <p>
            Point your camera at the QR code shown by the Officer for
            <strong>{{ selectedEvent.name }}</strong>.
          </p>

          <div class="camera qr">
            <span v-if="cameraError" class="camera-msg">
              {{ cameraError }}
            </span>

            <video
              v-show="!cameraError"
              ref="videoEl"
              autoplay
              playsinline
              muted
            ></video>
          </div>

          <p v-if="scanError" class="form-error">
            {{ scanError }}
          </p>

          <label class="upload-link">
            Scan from an image instead
            <input
              type="file"
              accept="image/*"
              hidden
              @change="scanImageFile"
            >
          </label>

          <button
            class="cancel"
            @click="closeCheckIn"
          >
            Cancel
          </button>

        </div>

        <!-- STEP 2: FACE -->
        <div v-if="step === 'face'">

          <h2>Verify it's you</h2>

          <p>
            QR code accepted. Center your face in the oval and look at the camera.
          </p>

          <div class="camera mirror">
            <span v-if="cameraError" class="camera-msg">
              {{ cameraError }}
            </span>

            <video
              v-show="!cameraError"
              ref="videoEl"
              autoplay
              playsinline
              muted
            ></video>
          </div>

          <p v-if="faceError" class="form-error">
            {{ faceError }}
          </p>

          <button
            class="primary"
            :disabled="verifying || !!cameraError"
            @click="verifyFace"
          >
            {{ verifying ? 'Verifying...' : 'Verify identity' }}
          </button>

          <button
            class="cancel"
            @click="closeCheckIn"
          >
            Cancel
          </button>

        </div>

        <!-- STEP 3: SUCCESS -->
        <div v-if="step === 'success'">

          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
          </div>

          <h2>Attendance recorded</h2>

          <p>
            Your QR code and face were verified for
            <strong>{{ selectedEvent.name }}</strong>.
          </p>

          <button
            class="primary"
            @click="closeCheckIn"
          >
            Done
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import jsQR from 'jsqr'
import { matchFaces, loadFaceModels } from '../utils/faceMatch'

defineEmits(['logout'])

/* =========================
   CURRENT USER
========================= */

const user = ref(
  JSON.parse(
    localStorage.getItem('user') || 'null'
  )
)

/* Registered face photo of the logged-in student */
function enrolledFace() {
  const users = JSON.parse(
    localStorage.getItem('users') || '[]'
  )

  const account = users.find(
    item => item.email === user.value?.email
  )

  return account?.faceImage || ''
}

/* =========================
   EVENTS + ATTENDANCE
========================= */

const events = ref([])
const attendance = ref([])

function loadEvents() {
  events.value = JSON.parse(
    localStorage.getItem('events') || '[]'
  )
}

function loadAttendance() {
  attendance.value = JSON.parse(
    localStorage.getItem('attendance') || '[]'
  )
}

function hasCheckedIn(event) {
  return attendance.value.some(
    record =>
      record.eventId === event.id &&
      record.email === user.value?.email
  )
}

/* =========================
   DISPLAY HELPERS
========================= */

const initials = computed(() =>
  (user.value?.name || 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('')
)

const firstName = computed(() =>
  (user.value?.name || 'Student').split(/\s+/)[0]
)

const checkedInCount = computed(() =>
  events.value.filter(event => hasCheckedIn(event)).length
)

const progress = computed(() =>
  events.value.length
    ? Math.round((checkedInCount.value / events.value.length) * 100)
    : 0
)

function eventDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return isNaN(date) ? null : date
}

function monthOf(value) {
  const date = eventDate(value)
  return date ? date.toLocaleString('en-US', { month: 'short' }) : ''
}

function dayOf(value) {
  const date = eventDate(value)
  return date ? date.getDate() : ''
}

function formatTime(value) {
  if (!value) {
    return ''
  }

  const [hours, minutes] = value.split(':').map(Number)

  return `${((hours + 11) % 12) + 1}:${String(minutes).padStart(2, '0')} ${
    hours >= 12 ? 'PM' : 'AM'
  }`
}

/*
 * Listens for localStorage changes from another
 * tab/window (works on the same browser only).
 */
function handleStorageChange(event) {
  if (event.key === 'events') {
    loadEvents()
  }

  if (event.key === 'attendance') {
    loadAttendance()
  }
}

function handleWindowFocus() {
  loadEvents()
  loadAttendance()
}

onMounted(() => {
  loadEvents()
  loadAttendance()

  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('focus', handleWindowFocus)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('focus', handleWindowFocus)

  stopCamera()
})

/* =========================
   CHECK-IN STATE
========================= */

const step = ref(null)
const selectedEvent = ref(null)

const videoEl = ref(null)
const cameraError = ref('')
const scanError = ref('')
const faceError = ref('')
const verifying = ref(false)

let stream = null
let rafId = null

/* =========================
   CAMERA HELPERS
========================= */

async function startCamera(facingMode) {
  cameraError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value =
      'Camera is not available. Open the system using https or localhost.'
    return false
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode } },
      audio: false
    })

    await nextTick()

    videoEl.value.srcObject = stream
    await videoEl.value.play()

    return true
  } catch {
    cameraError.value =
      'Unable to access the camera. Please allow camera permission.'
    return false
  }
}

function stopCamera() {
  cancelAnimationFrame(rafId)
  rafId = null

  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
}

/* =========================
   START CHECK-IN
========================= */

async function startCheckIn(event) {
  loadAttendance()

  if (hasCheckedIn(event)) {
    return
  }

  selectedEvent.value = event
  scanError.value = ''
  faceError.value = ''
  step.value = 'qr'

  await nextTick()

  if (await startCamera('environment')) {
    scanFrame()
  }
}

/* =========================
   STEP 1: QR SCAN
========================= */

const scanCanvas = document.createElement('canvas')

function scanFrame() {
  const video = videoEl.value

  if (step.value !== 'qr' || !video) {
    return
  }

  if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
    scanCanvas.width = video.videoWidth
    scanCanvas.height = video.videoHeight

    const ctx = scanCanvas.getContext('2d', {
      willReadFrequently: true
    })

    ctx.drawImage(video, 0, 0, scanCanvas.width, scanCanvas.height)

    const image = ctx.getImageData(
      0,
      0,
      scanCanvas.width,
      scanCanvas.height
    )

    const code = jsQR(image.data, image.width, image.height)

    if (code) {
      handleQRResult(code.data)

      if (step.value !== 'qr') {
        return
      }
    }
  }

  rafId = requestAnimationFrame(scanFrame)
}

/* Fallback: scan a QR code from an image file */
function scanImageFile(changeEvent) {
  const file = changeEvent.target.files?.[0]

  changeEvent.target.value = ''

  if (!file) {
    return
  }

  const url = URL.createObjectURL(file)
  const image = new Image()

  image.onload = () => {
    scanCanvas.width = image.width
    scanCanvas.height = image.height

    const ctx = scanCanvas.getContext('2d', {
      willReadFrequently: true
    })

    ctx.drawImage(image, 0, 0)

    URL.revokeObjectURL(url)

    const data = ctx.getImageData(0, 0, image.width, image.height)
    const code = jsQR(data.data, data.width, data.height)

    if (!code) {
      scanError.value = 'No QR code was found in that image.'
      return
    }

    handleQRResult(code.data)
  }

  image.src = url
}

/*
 * Checks the scanned QR against the event being checked in to.
 * Returns an error message, or '' if the QR code is valid.
 */
function validateQR(raw) {
  let payload

  try {
    payload = JSON.parse(raw)
  } catch {
    return 'This is not a valid CPSU event QR code.'
  }

  if (payload.eventId !== selectedEvent.value.id) {
    return 'This QR code is for a different event.'
  }

  loadEvents()

  const current = events.value.find(
    item => item.id === selectedEvent.value.id
  )

  if (!current) {
    return 'This event no longer exists.'
  }

  if (
    !current.qrExpiresAt ||
    payload.createdAt !== current.qrCreatedAt
  ) {
    return 'This QR code is outdated. Ask the Officer for the latest QR code.'
  }

  if (Date.now() >= current.qrExpiresAt) {
    return 'This QR code has expired.'
  }

  return ''
}

async function handleQRResult(raw) {
  const problem = validateQR(raw)

  if (problem) {
    scanError.value = problem
    return
  }

  scanError.value = ''

  // QR accepted: move on to facial verification
  stopCamera()

  step.value = 'face'

  loadFaceModels().catch(() => {}) // warm up while camera opens

  await nextTick()

  startCamera('user')
}

/* =========================
   STEP 2: FACE VERIFICATION
========================= */

async function verifyFace() {
  faceError.value = ''

  const video = videoEl.value

  if (!video || !video.videoWidth) {
    faceError.value = 'Camera is not ready yet. Please try again.'
    return
  }

  const enrolled = enrolledFace()

  if (!enrolled) {
    faceError.value =
      'No registered face photo found for your account. Please register again.'
    return
  }

  verifying.value = true

  // Full-resolution frame for matching, small JPEG for the record
  const frame = document.createElement('canvas')
  frame.width = video.videoWidth
  frame.height = video.videoHeight
  frame.getContext('2d').drawImage(video, 0, 0)

  const thumb = document.createElement('canvas')
  thumb.width = 240
  thumb.height = 180
  thumb.getContext('2d').drawImage(video, 0, 0, thumb.width, thumb.height)
  const livePhoto = thumb.toDataURL('image/jpeg', 0.6)

  let result

  try {
    result = await matchFaces(enrolled, frame)
  } catch {
    verifying.value = false
    faceError.value =
      'Could not load face recognition. Check your internet connection and try again.'
    return
  }

  verifying.value = false

  if (!result.matched) {
    faceError.value = result.reason || 'Face did not match. Please try again.'
    return
  }

  recordAttendance(livePhoto)
}

/* =========================
   STEP 3: RECORD ATTENDANCE
========================= */

function recordAttendance(livePhoto) {
  loadAttendance()

  // Prevent duplicate attendance for the same event
  if (hasCheckedIn(selectedEvent.value)) {
    stopCamera()
    step.value = 'success'
    return
  }

  const now = new Date()

  attendance.value.push({
    id: Date.now(),

    eventId: selectedEvent.value.id,
    event: selectedEvent.value.name,
    date: selectedEvent.value.date,

    time: now.toLocaleTimeString(),
    timestamp: now.getTime(),

    student: user.value?.name,
    studentId: user.value?.studentId,
    email: user.value?.email,

    qrVerified: true,
    faceVerified: true,
    facePhoto: livePhoto
  })

  localStorage.setItem(
    'attendance',
    JSON.stringify(attendance.value)
  )

  stopCamera()

  step.value = 'success'
}

/* =========================
   CLOSE CHECK-IN
========================= */

function closeCheckIn() {
  stopCamera()

  step.value = null
  selectedEvent.value = null

  scanError.value = ''
  faceError.value = ''
  cameraError.value = ''
  verifying.value = false
}
</script>

<style scoped>
.dashboard {
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
  background: var(--bg);
}

.dashboard *,
.dashboard *::before,
.dashboard *::after {
  box-sizing: border-box;
}

.dashboard svg {
  width: 17px;
  height: 17px;
  flex: none;
}

/* ---------- top bar ---------- */

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 68px;
  padding: 0 max(20px, 6%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--forest);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand strong,
.user-text strong {
  display: block;
  font-size: 15px;
  line-height: 1.2;
}

.brand small,
.user-text small {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, .65);
}

.logo {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--gold);
  color: var(--forest);
  font-weight: 800;
  font-size: 18px;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--mint);
  color: var(--forest);
  font-size: 14px;
  font-weight: 800;
}

.user-text {
  text-align: left;
}

.logout {
  height: 36px;
  margin-left: 6px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, .3);
  border-radius: 9px;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.logout:hover {
  background: rgba(255, 255, 255, .12);
}

/* ---------- main ---------- */

main {
  max-width: 880px;
  margin: 0 auto;
  padding: 32px 20px 64px;
}

.hero {
  padding: 30px 32px;
  border-radius: 20px;
  color: #fff;
  background:
    radial-gradient(circle at 92% 0%, rgba(232, 185, 49, .28), transparent 42%),
    linear-gradient(135deg, var(--forest-2), var(--forest));
}

.hero h1 {
  margin: 0 0 6px;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -.02em;
}

.hero p {
  margin: 0;
  color: rgba(255, 255, 255, .8);
  font-size: 15px;
}

.progress {
  height: 8px;
  margin-top: 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .18);
  overflow: hidden;
}

.progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--gold);
  transition: width .4s;
}

.section-title {
  margin: 34px 0 12px;
  font-size: 18px;
  font-weight: 800;
}

/* ---------- events ---------- */

.events {
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.event-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
}

.event-row + .event-row {
  border-top: 1px solid var(--line);
}

.date-chip {
  width: 56px;
  height: 60px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--mint);
  color: var(--green);
}

.date-chip span {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.date-chip strong {
  margin-top: 3px;
  font-size: 22px;
  line-height: 1;
}

.event-body {
  flex: 1;
  min-width: 0;
}

.event-body h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
}

.meta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 14px;
  color: var(--muted);
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn {
  height: 40px;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn.checkin {
  background: var(--green);
  color: #fff;
}

.btn.checkin:hover {
  background: var(--green-dark);
}

.btn.done {
  background: var(--mint);
  color: var(--green);
  cursor: default;
}

.no-events {
  padding: 56px 24px;
  border: 1px dashed var(--mint-2);
  border-radius: 16px;
  background: #fff;
  text-align: center;
  color: var(--muted);
}

.no-events svg {
  width: 40px;
  height: 40px;
  color: var(--leaf);
}

.no-events h3 {
  margin: 12px 0 6px;
  font-size: 18px;
  color: var(--ink);
}

.no-events p {
  max-width: 340px;
  margin: 0 auto;
  font-size: 14px;
  line-height: 1.5;
}

/* ---------- check-in modal ---------- */

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(7, 32, 23, .6);
  backdrop-filter: blur(3px);
}

.modal {
  width: 400px;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  padding: 26px;
  border-radius: 22px;
  background: #fff;
  text-align: center;
}

.modal h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -.01em;
}

.modal p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.steps {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 0 0 24px;
  padding: 0;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 5px;
  border-radius: 999px;
  background: #eef3f0;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.steps li span {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  font-size: 11px;
  font-weight: 800;
}

.steps li.active {
  background: var(--forest);
  color: #fff;
}

.steps li.active span {
  background: var(--gold);
  color: var(--forest);
}

.steps li.done {
  background: var(--mint);
  color: var(--green);
}

.steps li.done span {
  background: var(--green);
  color: #fff;
}

/* ---------- camera ---------- */

.camera {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  margin: 20px 0 14px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--forest);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera.mirror video {
  transform: scaleX(-1);
}

.camera::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.camera.qr::after {
  --c: var(--gold);
  --t: 4px;
  --l: 30px;
  inset: 17%;
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

.camera.mirror::after {
  inset: 8% 27%;
  border: 3px solid rgba(255, 255, 255, .9);
  border-radius: 50%;
  box-shadow: 0 0 0 999px rgba(7, 32, 23, .35);
}

.camera-msg {
  position: relative;
  z-index: 1;
  padding: 0 24px;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.form-error {
  margin: 0 0 12px !important;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--danger-bg);
  color: var(--danger) !important;
  font-size: 13px !important;
  font-weight: 500;
}

.upload-link {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--green);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.primary {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 10px;
  background: var(--green);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.primary:hover:not(:disabled) {
  background: var(--green-dark);
}

.primary:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.cancel {
  width: 100%;
  margin-top: 6px;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cancel:hover {
  color: var(--ink);
}

.success-icon {
  width: 72px;
  height: 72px;
  margin: 8px auto 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--mint);
  color: var(--green);
}

.success-icon svg {
  width: 36px;
  height: 36px;
  stroke-width: 2.6;
}

.success-icon + h2 {
  margin-top: 0;
}

.modal .primary {
  margin-top: 20px;
}

/* ---------- mobile ---------- */

@media (max-width: 600px) {
  .user-text {
    display: none;
  }

  .hero {
    padding: 24px 22px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .event-row {
    flex-wrap: wrap;
    padding: 16px;
  }

  .event-body {
    flex-basis: calc(100% - 76px);
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* ---------- extra small screens ---------- */

@media (max-width: 420px) {
  .topbar {
    padding: 0 14px;
  }

  .brand small {
    display: none;
  }

  .brand {
    min-width: 0;
    gap: 10px;
  }

  .brand strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout {
    padding: 0 12px;
    margin-left: 0;
  }

  main {
    padding: 20px 14px 48px;
  }

  .modal {
    padding: 20px 16px;
  }

  .steps {
    flex-wrap: wrap;
  }

  .steps li {
    font-size: 11px;
  }
}

/* short screens (phones held sideways) */
@media (max-height: 520px) {
  .overlay {
    align-items: flex-start;
  }

  .camera {
    aspect-ratio: 16 / 9;
  }
}

/* large screens */
@media (min-width: 1400px) {
  main {
    max-width: 960px;
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