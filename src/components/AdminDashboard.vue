<template>
  <div class="admin">

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ open: menuOpen }">
      <div class="logo">
        <div class="logo-icon">C</div>
        <span>CPSU Attendance</span>
        <button
          class="drawer-close"
          aria-label="Close menu"
          @click="menuOpen = false"
        >
          ×
        </button>
      </div>

      <div class="admin-profile">
        <div class="profile-icon">O</div>
        <div>
          <strong>Officer</strong>
          <small>Authorized Officer</small>
        </div>
      </div>

      <nav @click="menuOpen = false">
        <button
          :class="{ active: section === 'overview' }"
          @click="section = 'overview'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg> Dashboard
        </button>

        <button
          :class="{ active: section === 'events' }"
          @click="section = 'events'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg> Events
        </button>

        <button
          :class="{ active: section === 'attendance' }"
          @click="loadAttendance(); section = 'attendance'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 8h6M9 12h6M9 16h4"/></svg> Attendance
        </button>

        <button
          :class="{ active: section === 'students' }"
          @click="section = 'students'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.4c2.2.6 3.5 2.6 3.5 5.6"/></svg> Students
        </button>
      </nav>

      <button class="logout" @click="$emit('logout')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/><path d="M10 8l-4 4 4 4M6 12h10"/></svg> Logout
      </button>
    </aside>

    <!-- Backdrop (small screens, when the menu is open) -->
    <div
      v-if="menuOpen"
      class="backdrop"
      @click="menuOpen = false"
    ></div>

    <!-- MAIN CONTENT -->
    <main class="content">

      <!-- TOP BAR -->
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="menu-btn"
            aria-label="Open menu"
            :aria-expanded="menuOpen"
            @click="menuOpen = true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>

          <div class="topbar-title">
            <h1>{{ pageTitle }}</h1>
            <p>Monitor student attendance during university events</p>
          </div>
        </div>

        <div class="admin-badge">
          <span class="online"></span>
          Officer
        </div>
      </header>

      <!-- ================= DASHBOARD ================= -->
      <section v-if="section === 'overview'">

        <div class="welcome">
          <div>
            <h2>Welcome, Officer</h2>
            <p>Here's the latest CPSU event attendance.</p>
          </div>

          <button class="primary-btn" @click="openCreateForm">
            + Create Event
          </button>
        </div>

        <!-- STATS -->
        <div class="stats">

          <div class="stat-card">
            <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.4c2.2.6 3.5 2.6 3.5 5.6"/></svg></div>

            <div>
              <span>Total Students</span>
              <strong>{{ students.length }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div>

            <div>
              <span>Total Events</span>
              <strong>{{ events.length }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>

            <div>
              <span>Attendance</span>
              <strong>{{ attendance.length }}</strong>
            </div>
          </div>

        </div>

        <!-- RECENT ATTENDANCE -->
        <div class="card">

          <div class="card-header">
            <div>
              <h3>Recent Attendance</h3>
              <p>Latest attendance records</p>
            </div>

            <button
              class="text-btn"
              @click="loadAttendance(); section = 'attendance'"
            >
              View All
            </button>
          </div>

          <div
            v-if="attendance.length"
            class="table-wrapper"
          >

            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Event</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(record, index) in recentAttendance"
                  :key="index"
                >
                  <td>{{ record.student }}</td>
                  <td>{{ record.event }}</td>
                  <td>{{ record.time }}</td>
                </tr>
              </tbody>
            </table>

          </div>

          <div
            v-else
            class="empty"
          >
            No attendance records yet.
          </div>

        </div>

        <!-- QUICK EVENTS -->
        <div class="card">

          <div class="card-header">
            <div>
              <h3>Events</h3>
              <p>Manage your school events</p>
            </div>

            <button
              class="text-btn"
              @click="section = 'events'"
            >
              View All
            </button>
          </div>

          <div
            v-if="events.length"
            class="event-list"
          >

            <div
              v-for="event in events.slice(0, 3)"
              :key="event.id"
              class="event-item"
            >

              <div class="event-info">

                <div class="event-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div>

                <div class="event-text">

                  <strong>
                    {{ event.name }}
                  </strong>

                  <small>
                    {{ event.date }} at {{ event.time }}
                  </small>

                  <small>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> {{ event.location }}
                  </small>

                </div>

              </div>

              <div class="event-actions">

                <button
                  class="edit-btn"
                  @click="openEditForm(event)"
                >
                  Edit
                </button>

                <button
                  class="delete-btn"
                  @click="deleteEvent(event)"
                >
                  Delete
                </button>

                <button
                  class="qr-btn"
                  @click="generateQR(event)"
                >
                  Generate QR
                </button>

              </div>

            </div>

          </div>

          <div
            v-else
            class="empty"
          >
            No events created yet.
          </div>

        </div>

      </section>

      <!-- ================= EVENTS ================= -->
      <section v-else-if="section === 'events'">

        <div class="section-heading">

          <div>
            <h2>Events</h2>
            <p>Create and manage attendance events.</p>
          </div>

        </div>

        <div
          v-if="events.length"
          class="events-grid"
        >

          <div
            v-for="event in events"
            :key="event.id"
            class="event-card"
          >

            <div class="event-card-top">

              <div class="event-icon large"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div>

              <div class="event-status" :class="qrStatus(event).toLowerCase().replace(' ', '-')">
                {{ qrStatus(event) }}
              </div>

            </div>

            <h3>
              {{ event.name }}
            </h3>

            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg> {{ event.date }}
            </p>

            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> {{ event.time }}
            </p>

            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> {{ event.location }}
            </p>
            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.4c2.2.6 3.5 2.6 3.5 5.6"/></svg> {{ attendeeCount(event) }} checked in
            </p>

            <div
              v-if="event.qrExpiresAt"
              class="expiration"
            >
              <strong>QR expires:</strong>
              {{ formatExpiration(event.qrExpiresAt) }}
            </div>

            <div class="card-actions">

              <button
                class="edit-btn"
                @click="openEditForm(event)"
              >
                Edit
              </button>

              <button
                class="delete-btn"
                @click="deleteEvent(event)"
              >
                Delete
              </button>

              <button
                class="qr-btn full"
                @click="generateQR(event)"
              >
                Generate QR
              </button>

            </div>

          </div>

        </div>

        <div
          v-else
          class="empty large-empty"
        >

          <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div>

          <h3>
            No Events Yet
          </h3>

          <p>
            Create your first event to start recording attendance.
          </p>

          <button
            class="primary-btn"
            @click="openCreateForm"
          >
            + Create Event
          </button>

        </div>

      </section>

      <!-- ================= ATTENDANCE ================= -->
      <section v-else-if="section === 'attendance'">
        <div class="section-heading with-action">
          <div>
            <h2>Attendance</h2>
            <p>Monitor student attendance in real time.</p>
          </div>

          <button
            class="primary-btn"
            :disabled="!filteredAttendance.length"
            @click="exportAttendance"
          >
            Export CSV
          </button>
        </div>

        <div class="card">
          <div class="filters">
            <select v-model="attendanceEventFilter">
              <option value="all">All events</option>
              <option
                v-for="event in events"
                :key="event.id"
                :value="event.id"
              >
                {{ event.name }}
              </option>
            </select>

            <input
              v-model="attendanceSearch"
              type="text"
              placeholder="Search student name or ID"
            >

            <span class="result-count">
              {{ filteredAttendance.length }} record(s)
            </span>
          </div>

          <div
            v-if="filteredAttendance.length"
            class="table-wrapper"
          >
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Event</th>
                  <th>Date &amp; Time</th>
                  <th>Verification</th>
                  <th>Photo</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(record, index) in filteredAttendance"
                  :key="record.id || index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ record.student }}</td>
                  <td>{{ record.studentId || '—' }}</td>
                  <td>{{ record.event }}</td>
                  <td>{{ formatCheckIn(record) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="record.qrVerified ? 'ok' : 'warn'"
                    >
                      QR
                    </span>
                    <span
                      class="badge"
                      :class="record.faceVerified ? 'ok' : 'warn'"
                    >
                      Face
                    </span>
                  </td>
                  <td>
                    <button
                      v-if="record.facePhoto"
                      class="text-btn"
                      @click="viewRecord = record"
                    >
                      View
                    </button>
                    <span v-else>—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="empty"
          >
            No attendance records available.
          </div>
        </div>
      </section>

      <!-- ================= STUDENTS ================= -->
      <section v-else-if="section === 'students'">
        <div class="section-heading">
          <div>
            <h2>Students</h2>
            <p>Students registered in the CPSU attendance system.</p>
          </div>
        </div>

        <div class="card">
          <div
            v-if="students.length"
            class="table-wrapper"
          >
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th>Face Enrollment</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(student, index) in students"
                  :key="index"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ student.name }}</td>
                  <td>{{ student.studentId || '—' }}</td>
                  <td>{{ student.email }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="student.faceEnrolled ? 'ok' : 'warn'"
                    >
                      {{ student.faceEnrolled ? 'Enrolled' : 'Not enrolled' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="empty"
          >
            No registered students yet.
          </div>
        </div>
      </section>
    </main>

    <!-- ================= CREATE / EDIT MODAL ================= -->
    <div
      v-if="showForm"
      class="modal-overlay"
      @click.self="closeForm"
    >

      <div class="modal">

        <div class="modal-header">

          <div>

            <h2>
              {{ editingEvent ? 'Edit Event' : 'Create Event' }}
            </h2>

            <p>
              {{
                editingEvent
                  ? 'Update your event information.'
                  : 'Create an event for student attendance.'
              }}
            </p>

          </div>

          <button
            class="close-btn"
            @click="closeForm"
          >
            ×
          </button>

        </div>

        <form @submit.prevent="saveEvent">

          <label>
            Event Name
          </label>

          <input
            v-model="newEvent.name"
            type="text"
            placeholder="Example: IT Department Seminar"
            required
          >

          <div class="form-row">

            <div>

              <label>
                Date
              </label>

              <input
                v-model="newEvent.date"
                type="date"
                required
              >

            </div>

            <div>

              <label>
                Time
              </label>

              <input
                v-model="newEvent.time"
                type="time"
                required
              >

            </div>

          </div>

          <label>
            Location
          </label>

          <input
            v-model="newEvent.location"
            type="text"
            placeholder="Example: AVR Room"
            required
          >

          <div class="modal-actions">

            <button
              type="button"
              class="cancel-btn"
              @click="closeForm"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="primary-btn"
            >
              {{ editingEvent ? 'Save Changes' : 'Create Event' }}
            </button>

          </div>

        </form>

      </div>

    </div>

    <!-- ================= QR MODAL ================= -->
    <div
      v-if="qrImage"
      class="modal-overlay"
      @click.self="closeQR"
    >

      <div class="qr-modal">

        <button
          class="close-btn qr-close"
          @click="closeQR"
        >
          ×
        </button>

        <h2>
          Event QR Code
        </h2>

        <h3>
          {{ selectedEvent?.name }}
        </h3>

        <div class="qr-valid">
          ✓ QR Code Valid for 24 Hours
        </div>

        <img
          :src="qrImage"
          alt="Event QR Code"
          class="qr-image"
        >

        <div class="qr-details">

          <p>
            <strong>Event:</strong>
            {{ selectedEvent?.name }}
          </p>

          <p>
            <strong>Date:</strong>
            {{ selectedEvent?.date }}
          </p>

          <p>
            <strong>Time:</strong>
            {{ selectedEvent?.time }}
          </p>

          <p>
            <strong>Location:</strong>
            {{ selectedEvent?.location }}
          </p>

          <p class="expires">
            <strong>QR Expires:</strong>
            {{ formatExpiration(selectedEvent?.qrExpiresAt) }}
          </p>

        </div>

        <p class="qr-note">
          Students must scan this QR code before it expires.
        </p>

        <button
          class="primary-btn download-btn"
          @click="downloadQR"
        >
          Download QR Code
        </button>

      </div>

    </div>

      <!-- ================= IDENTITY CHECK MODAL ================= -->
    <div
      v-if="viewRecord"
      class="modal-overlay"
      @click.self="viewRecord = null"
    >
      <div class="compare-modal">
        <button
          class="close-btn"
          @click="viewRecord = null"
        >
          ×
        </button>

        <h2>Identity Check</h2>
        <p class="compare-sub">
          {{ viewRecord.student }}, {{ viewRecord.event }}
        </p>

        <div class="compare-grid">
          <figure>
            <img
              v-if="enrolledFace(viewRecord)"
              :src="enrolledFace(viewRecord)"
              alt="Registered face"
            >
            <div v-else class="no-photo">No photo</div>
            <figcaption>Registered photo</figcaption>
          </figure>

          <figure>
            <img
              :src="viewRecord.facePhoto"
              alt="Check-in face"
            >
            <figcaption>Check-in photo</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  watch
} from 'vue'

import QRCode from 'qrcode'

const emit = defineEmits(['logout'])

const section = ref('overview')

const showForm = ref(false)
const editingEvent = ref(null)

const qrImage = ref('')
const selectedEvent = ref(null)

const newEvent = ref({
  name: '',
  date: '',
  time: '',
  location: ''
})

/* =========================
   LOAD DATA
========================= */

const events = ref(
  JSON.parse(
    localStorage.getItem('events') || '[]'
  )
)

const attendance = ref(
  JSON.parse(
    localStorage.getItem('attendance') || '[]'
  )
)

const students = ref(
  JSON.parse(
    localStorage.getItem('students') || '[]'
  )
)

/* =========================
   PAGE TITLE
========================= */

const pageTitle = computed(() => {

  if (section.value === 'events') {
    return 'Events'
  }

  if (section.value === 'attendance') {
    return 'Attendance'
  }

  if (section.value === 'students') {
    return 'Students'
  }

  return 'Dashboard'
})

/* =========================
   RECENT ATTENDANCE
========================= */

const recentAttendance = computed(() => {

  return attendance.value
    .slice(-5)
    .reverse()

})

/* =========================
   LOAD ATTENDANCE
========================= */

function loadAttendance() {

  attendance.value = JSON.parse(
    localStorage.getItem('attendance') || '[]'
  )

}

/* =========================
   LOAD STUDENTS
========================= */

function loadStudents() {

  students.value = JSON.parse(
    localStorage.getItem('students') || '[]'
  )

}

/* =========================
   LOAD EVENTS
========================= */

function loadEvents() {

  events.value = JSON.parse(
    localStorage.getItem('events') || '[]'
  )

}

/* =========================
   REFRESH ALL DATA
========================= */

function refreshData() {

  loadAttendance()
  loadStudents()
  loadEvents()

}

/* =========================
   STORAGE CHANGE
========================= */

function handleStorageChange(event) {

  if (event.key === 'attendance') {

    loadAttendance()

  }

  if (event.key === 'students') {

    loadStudents()

  }

  if (event.key === 'events') {

    loadEvents()

  }

}

/* =========================
   WINDOW FOCUS
========================= */

function handleWindowFocus() {

  refreshData()

}

/* =========================
   CREATE / EDIT EVENT
========================= */

function openCreateForm() {

  editingEvent.value = null

  newEvent.value = {
    name: '',
    date: '',
    time: '',
    location: ''
  }

  showForm.value = true

}

function openEditForm(event) {

  editingEvent.value = event

  newEvent.value = {
    name: event.name,
    date: event.date,
    time: event.time,
    location: event.location
  }

  showForm.value = true

}

function closeForm() {

  showForm.value = false

  editingEvent.value = null

}

function saveEvent() {

  if (editingEvent.value) {

    const index = events.value.findIndex(
      event =>
        event.id === editingEvent.value.id
    )

    if (index !== -1) {

      events.value[index].name =
        newEvent.value.name

      events.value[index].date =
        newEvent.value.date

      events.value[index].time =
        newEvent.value.time

      events.value[index].location =
        newEvent.value.location

    }

  } else {

    const event = {

      id: Date.now(),

      name: newEvent.value.name,

      date: newEvent.value.date,

      time: newEvent.value.time,

      location: newEvent.value.location,

      qrCreatedAt: null,

      qrExpiresAt: null

    }

    events.value.push(event)

  }

  localStorage.setItem(
    'events',
    JSON.stringify(events.value)
  )

  closeForm()

}

/* =========================
   DELETE EVENT
========================= */

function deleteEvent(event) {

  const confirmed = confirm(
    `Are you sure you want to delete "${event.name}"?`
  )

  if (!confirmed) {
    return
  }

  events.value = events.value.filter(
    item => item.id !== event.id
  )

  localStorage.setItem(
    'events',
    JSON.stringify(events.value)
  )

  if (
    selectedEvent.value &&
    selectedEvent.value.id === event.id
  ) {

    closeQR()

  }

}

/* =========================
   GENERATE QR CODE
========================= */

async function generateQR(event) {

  const createdAt = Date.now()

  const expiresAt =
    createdAt +
    (24 * 60 * 60 * 1000)

  event.qrCreatedAt = createdAt

  event.qrExpiresAt = expiresAt

  localStorage.setItem(
    'events',
    JSON.stringify(events.value)
  )

  selectedEvent.value = event

  const qrData = {

    eventId: event.id,

    event: event.name,

    createdAt: createdAt,

    expiresAt: expiresAt

  }

  try {

    qrImage.value =
      await QRCode.toDataURL(
        JSON.stringify(qrData),
        {
          width: 300,
          margin: 2
        }
      )

  } catch (error) {

    console.error(
      'QR generation failed:',
      error
    )

    alert(
      'Unable to generate QR code.'
    )

  }

}

/* =========================
   QR STATUS
========================= */

function qrStatus(event) {

  if (!event.qrExpiresAt) {

    return 'No QR'

  }

  if (
    Date.now() >=
    event.qrExpiresAt
  ) {

    return 'Expired'

  }

  return 'Active'

}

/* =========================
   EXPIRATION FORMAT
========================= */

function formatExpiration(timestamp) {

  if (!timestamp) {

    return 'Not available'

  }

  return new Date(
    timestamp
  ).toLocaleString()

}

/* =========================
   CLOSE QR
========================= */

function closeQR() {

  qrImage.value = ''

  selectedEvent.value = null

}

/* =========================
   DOWNLOAD QR
========================= */

function downloadQR() {

  if (
    !qrImage.value ||
    !selectedEvent.value
  ) {

    return

  }

  const link =
    document.createElement('a')

  link.href = qrImage.value

  link.download =
    `${selectedEvent.value.name}-QR.png`

  link.click()

}

/* =========================
   MOBILE MENU (sidebar drawer)
========================= */

const menuOpen = ref(false)

const desktopQuery = window.matchMedia('(min-width: 961px)')

function handleDesktopChange(event) {
  // Sidebar is always visible on large screens, so close the drawer
  if (event.matches) {
    menuOpen.value = false
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    menuOpen.value = false
  }
}

// Stop the page behind the drawer from scrolling while it is open
watch(menuOpen, open => {
  document.body.style.overflow = open ? 'hidden' : ''
})

/* =========================
   ATTENDANCE FILTERS
========================= */

const attendanceEventFilter = ref('all')
const attendanceSearch = ref('')
const viewRecord = ref(null)

let pollTimer = null

const filteredAttendance = computed(() => {
  const search = attendanceSearch.value.trim().toLowerCase()

  const selected = events.value.find(
    event => event.id === attendanceEventFilter.value
  )

  return attendance.value
    .filter(record => {
      if (attendanceEventFilter.value === 'all') {
        return true
      }

      return (
        record.eventId === attendanceEventFilter.value ||
        (record.eventId == null && selected && record.event === selected.name)
      )
    })
    .filter(record => {
      if (!search) {
        return true
      }

      return (
        (record.student || '').toLowerCase().includes(search) ||
        (record.studentId || '').toLowerCase().includes(search)
      )
    })
})

function attendeeCount(event) {
  return attendance.value.filter(
    record =>
      record.eventId === event.id ||
      (record.eventId == null && record.event === event.name)
  ).length
}

function formatCheckIn(record) {
  if (record.timestamp) {
    return new Date(record.timestamp).toLocaleString()
  }

  return `${record.date || ''} ${record.time || ''}`.trim()
}

/* Registered face photo of the student in an attendance record */
function enrolledFace(record) {
  const users = JSON.parse(
    localStorage.getItem('users') || '[]'
  )

  const account = users.find(
    user =>
      user.email === record.email ||
      (record.studentId && user.studentId === record.studentId)
  )

  return account?.faceImage || ''
}

/* =========================
   EXPORT ATTENDANCE (CSV)
========================= */

function exportAttendance() {
  const rows = [
    [
      'Student',
      'Student ID',
      'Email',
      'Event',
      'Event Date',
      'Check-in Time',
      'QR Verified',
      'Face Verified'
    ]
  ]

  filteredAttendance.value.forEach(record => {
    rows.push([
      record.student,
      record.studentId,
      record.email,
      record.event,
      record.date,
      formatCheckIn(record),
      record.qrVerified ? 'Yes' : 'No',
      record.faceVerified ? 'Yes' : 'No'
    ])
  })

  const csv = rows
    .map(row =>
      row
        .map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\r\n')

  const link = document.createElement('a')

  link.href = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  )
  link.download = 'cpsu-attendance.csv'
  link.click()

  URL.revokeObjectURL(link.href)
}

/* =========================
   LIFECYCLE
========================= */

onMounted(() => {
  refreshData()

  // Keeps the dashboard updating while students check in
  pollTimer = setInterval(refreshData, 3000)

  desktopQuery.addEventListener('change', handleDesktopChange)
  window.addEventListener('keydown', handleKeydown)


  window.addEventListener(
    'storage',
    handleStorageChange
  )

  window.addEventListener(
    'focus',
    handleWindowFocus
  )

})

onUnmounted(() => {
  clearInterval(pollTimer)
  desktopQuery.removeEventListener('change', handleDesktopChange)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''


  window.removeEventListener(
    'storage',
    handleStorageChange
  )

  window.removeEventListener(
    'focus',
    handleWindowFocus
  )

})
</script>

<style scoped>
.admin {
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
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  background: var(--bg);
}

.admin *,
.admin *::before,
.admin *::after {
  box-sizing: border-box;
}

.admin svg {
  width: 18px;
  height: 18px;
  flex: none;
}

/* ---------- sidebar ---------- */

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  padding: 24px 16px;
  background: linear-gradient(180deg, var(--forest), #082e21);
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  font-size: 17px;
  font-weight: 800;
}

.logo-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: var(--gold);
  color: var(--forest);
  font-size: 19px;
  font-weight: 800;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, .07);
}

.profile-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--mint);
  color: var(--forest);
  font-weight: 800;
}

.admin-profile strong {
  display: block;
  font-size: 14px;
}

.admin-profile small {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, .6);
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar nav button,
.sidebar .logout {
  position: relative;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, .72);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background .15s, color .15s;
}

.sidebar nav button:hover,
.sidebar .logout:hover {
  background: rgba(255, 255, 255, .08);
  color: #fff;
}

.sidebar nav button.active {
  background: rgba(255, 255, 255, .14);
  color: #fff;
}

.sidebar nav button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 11px;
  bottom: 11px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: var(--gold);
}

.sidebar .logout {
  margin-top: auto;
  border: 1px solid rgba(255, 255, 255, .18);
}

/* ---------- content ---------- */

.content {
  min-width: 0;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 40px 56px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.topbar h1 {
  margin: 0 0 2px;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -.02em;
}

.topbar p {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
}

.online {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--leaf);
  box-shadow: 0 0 0 4px rgba(47, 163, 107, .2);
}

/* ---------- welcome banner ---------- */

.welcome {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 20px;
  margin-bottom: 20px;
  padding: 26px 30px;
  border-radius: 18px;
  color: #fff;
  background:
    radial-gradient(circle at 94% 0%, rgba(232, 185, 49, .3), transparent 40%),
    linear-gradient(135deg, var(--forest-2), var(--forest));
}

.welcome h2 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -.01em;
}

.welcome p {
  margin: 0;
  color: rgba(255, 255, 255, .8);
  font-size: 14px;
}

/* ---------- buttons ---------- */

.primary-btn {
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  background: var(--green);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s;
}

.primary-btn:hover:not(:disabled) {
  background: var(--green-dark);
}

.primary-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.welcome .primary-btn {
  background: var(--gold);
  color: var(--forest);
}

.welcome .primary-btn:hover {
  background: #f0c646;
}

.text-btn {
  padding: 4px 2px;
  border: none;
  background: none;
  color: var(--green);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.text-btn:hover {
  text-decoration: underline;
}

.edit-btn,
.delete-btn,
.qr-btn,
.cancel-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.edit-btn,
.cancel-btn {
  border: 1.5px solid var(--line);
  background: #fff;
  color: var(--ink);
}

.edit-btn:hover,
.cancel-btn:hover {
  border-color: var(--green);
  color: var(--green);
}

.delete-btn {
  border: 1.5px solid transparent;
  background: var(--danger-bg);
  color: var(--danger);
}

.delete-btn:hover {
  border-color: var(--danger);
}

.qr-btn {
  border: 1.5px solid transparent;
  background: var(--green);
  color: #fff;
}

.qr-btn:hover {
  background: var(--green-dark);
}

.cancel-btn {
  height: 42px;
  padding: 0 20px;
  font-size: 14px;
}

/* ---------- stats ---------- */

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
}

.stat-card + .stat-card {
  border-left: 1px solid var(--line);
}

.stat-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: var(--mint);
  color: var(--green);
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.stat-card span {
  display: block;
  font-size: 13px;
  color: var(--muted);
}

.stat-card strong {
  display: block;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
}

/* ---------- cards + tables ---------- */

.card {
  margin-bottom: 20px;
  padding: 22px 24px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.card-header p {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.table-wrapper {
  overflow-x: auto;
}

.table-wrapper table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table-wrapper th {
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  background: #f7faf8;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

.table-wrapper td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.table-wrapper tbody tr:last-child td {
  border-bottom: none;
}

.table-wrapper tbody tr:hover {
  background: #f7faf8;
}

.empty {
  padding: 36px 16px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.large-empty {
  padding: 64px 16px;
  border: 1px dashed var(--mint-2);
  border-radius: 16px;
  background: #fff;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: var(--leaf);
}

.large-empty h3 {
  margin: 8px 0 4px;
  font-size: 19px;
  color: var(--ink);
}

.large-empty p {
  margin: 0 0 18px;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  margin-right: 4px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge.ok {
  background: var(--mint);
  color: var(--green);
}

.badge.warn {
  background: var(--warn-bg);
  color: var(--warn);
}

/* ---------- events ---------- */

.section-heading {
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 800;
}

.section-heading p {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.section-heading.with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.event-list {
  display: flex;
  flex-direction: column;
}

.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
}

.event-item + .event-item {
  border-top: 1px solid var(--line);
}

.event-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.event-icon {
  width: 44px;
  height: 44px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--mint);
  color: var(--green);
}

.event-icon.large {
  width: 48px;
  height: 48px;
}

.event-text strong {
  display: block;
  font-size: 15px;
}

.event-text small {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
  font-size: 13px;
  color: var(--muted);
}

.event-text small svg,
.event-card p svg {
  width: 15px;
  height: 15px;
}

.event-actions {
  display: flex;
  gap: 8px;
  flex: none;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 16px;
}

.event-card {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
}

.event-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.event-card h3 {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 800;
}

.event-card p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 14px;
  color: var(--muted);
}

.event-status {
  padding: 4px 12px;
  border-radius: 999px;
  background: #eef3f0;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.event-status.active {
  background: var(--mint);
  color: var(--green);
}

.event-status.expired {
  background: var(--danger-bg);
  color: var(--danger);
}

.expiration {
  margin-top: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: #f7faf8;
  font-size: 13px;
  color: var(--muted);
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 16px;
}

.qr-btn.full {
  grid-column: 1 / -1;
}

/* ---------- attendance filters ---------- */

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filters select,
.filters input {
  height: 42px;
  min-width: 200px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 14px;
}

.filters select:focus,
.filters input:focus,
.modal input:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 4px rgba(15, 122, 77, .15);
}

.result-count {
  margin-left: auto;
  font-size: 13px;
  color: var(--muted);
}

/* ---------- modals ---------- */

.modal-overlay {
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

.modal,
.qr-modal,
.compare-modal {
  position: relative;
  width: 480px;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  padding: 28px;
  border-radius: 20px;
  background: #fff;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-header h2,
.qr-modal h2,
.compare-modal h2 {
  margin: 0 0 4px;
  font-size: 21px;
  font-weight: 800;
}

.modal-header p {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.close-btn {
  width: 34px;
  height: 34px;
  flex: none;
  padding: 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: #eef3f0;
  color: var(--ink);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--mint-2);
}

.qr-close,
.compare-modal .close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}

.modal label {
  display: block;
  margin: 14px 0 6px;
  font-size: 13px;
  font-weight: 700;
}

.modal input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.qr-modal {
  width: 400px;
  text-align: center;
}

.qr-modal h3 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--muted);
}

.qr-valid {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--mint);
  color: var(--green);
  font-size: 13px;
  font-weight: 700;
}

.qr-image {
  display: block;
  width: 220px;
  height: 220px;
  margin: 16px auto;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 16px;
}

.qr-details {
  padding: 12px 16px;
  border-radius: 12px;
  background: #f7faf8;
  text-align: left;
}

.qr-details p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--muted);
}

.qr-details strong {
  color: var(--ink);
}

.qr-note {
  margin: 12px 0 16px;
  font-size: 13px;
  color: var(--muted);
}

.download-btn {
  width: 100%;
}

.compare-modal {
  width: 520px;
  text-align: center;
}

.compare-sub {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 14px;
}

.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.compare-grid figure {
  margin: 0;
}

.compare-grid img,
.no-photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  background: var(--forest);
}

.no-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, .6);
  font-size: 13px;
}

.compare-grid figcaption {
  margin-top: 6px;
  font-size: 13px;
  color: var(--muted);
}

/* ---------- mid-size screens ---------- */

@media (max-width: 1180px) {
  .content {
    padding-left: 28px;
    padding-right: 28px;
  }

  .stat-card {
    gap: 12px;
    padding: 18px 16px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .welcome {
    padding: 22px 24px;
  }
}

/* ---------- menu button, drawer, backdrop ---------- */

.menu-btn,
.drawer-close,
.backdrop {
  display: none;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.topbar-title {
  min-width: 0;
}

.menu-btn {
  width: 44px;
  height: 44px;
  flex: none;
  padding: 0;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}

.menu-btn:hover {
  border-color: var(--green);
  color: var(--green);
}

.drawer-close {
  width: 34px;
  height: 34px;
  margin-left: auto;
  padding: 0;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, .1);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.drawer-close:hover {
  background: rgba(255, 255, 255, .2);
}

/* ---------- tablet and smaller: sidebar becomes a drawer ---------- */

@media (max-width: 960px) {
  .admin {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1100;
    width: 290px;
    max-width: 86vw;
    height: 100%;
    overflow-y: auto;
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform .25s ease, visibility 0s linear .25s;
  }

  .sidebar.open {
    transform: none;
    visibility: visible;
    box-shadow: 0 0 50px rgba(0, 0, 0, .4);
    transition: transform .25s ease, visibility 0s;
  }

  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1050;
    background: rgba(7, 32, 23, .55);
    backdrop-filter: blur(2px);
  }

  .menu-btn,
  .drawer-close {
    display: grid;
  }

  .content {
    padding: 20px 20px 48px;
  }

  .topbar {
    margin-bottom: 22px;
  }
}

/* ---------- phones ---------- */

@media (max-width: 640px) {
  .content {
    padding: 16px 14px 40px;
  }

  .topbar h1 {
    font-size: 22px;
  }

  .topbar p,
  .admin-badge {
    display: none;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px 18px;
  }

  .stat-card + .stat-card {
    border-left: none;
    border-top: 1px solid var(--line);
  }

  .welcome {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 20px;
  }

  .welcome h2 {
    font-size: 21px;
  }

  .card {
    padding: 16px;
  }

  .card-header {
    align-items: flex-start;
  }

  .event-item {
    flex-direction: column;
    align-items: stretch;
  }

  .event-actions {
    flex-wrap: wrap;
  }

  .event-actions button {
    flex: 1 1 auto;
  }

  .section-heading.with-action .primary-btn {
    width: 100%;
  }

  .filters select,
  .filters input {
    min-width: 0;
    width: 100%;
  }

  .result-count {
    margin-left: 0;
  }

  .modal,
  .qr-modal,
  .compare-modal {
    padding: 22px 18px;
  }

  .form-row,
  .compare-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .card-actions {
    grid-template-columns: 1fr;
  }

  .qr-image {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
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