<template>
  <!-- LOGIN -->
  <Login
    v-if="page === 'login'"
    @login="loginSuccess"
    @register="page = 'register'"
  />

  <!-- REGISTRATION -->
  <Registration
    v-else-if="page === 'register'"
    @register="loginSuccess('student')"
    @login="page = 'login'"
  />

  <!-- STUDENT DASHBOARD -->
  <StudentDashboard
    v-else-if="page === 'student'"
    @logout="logout"
  />

  <!-- ADMIN DASHBOARD -->
  <AdminDashboard
    v-else-if="page === 'admin'"
    @logout="logout"
  />
</template>

<script setup>
import { ref } from 'vue'

import Login from './components/Login.vue'
import Registration from './components/Registration.vue'
import StudentDashboard from './components/StudentDashboard.vue'
import AdminDashboard from './components/AdminDashboard.vue'

const page = ref('login')

function loginSuccess(role) {
  page.value = role
}

function logout() {
  // Clear the current student session so the next user starts clean
  localStorage.removeItem('user')

  page.value = 'login'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  display: block !important;
  place-items: initial !important;
  min-width: 320px;
  background: #f3f7f4;
  color: #12261e;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
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

button,
input,
select {
  font-family: inherit;
}

button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid rgba(15, 122, 77, .45);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>