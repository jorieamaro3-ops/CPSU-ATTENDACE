// Single switch for the showcase / demo version of the app.
// true  = sample data is preloaded and demo buttons are shown
// false = normal behaviour (set this before real use)
export const DEMO_MODE = true

const pad = n => String(n).padStart(2, '0')

function dateFromToday(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Fills the browser with sample events and students the first time the
// app opens, so a visitor never sees an empty system.
export function seedDemoData() {
  if (!DEMO_MODE) return

  try {
    const hasEvents =
      JSON.parse(localStorage.getItem('events') || '[]').length > 0

    if (hasEvents || localStorage.getItem('demoSeeded')) return

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    // Fixed ids so a QR made on one device is valid on every other device
    const events = [
      {
        id: 1001,
        name: 'General Assembly',
        date: dateFromToday(0),
        time: '09:00',
        location: 'University Gymnasium'
      },
      {
        id: 1002,
        name: 'Programming Contest',
        date: dateFromToday(1),
        time: '13:30',
        location: 'Computer Laboratory 2'
      },
      {
        id: 1003,
        name: 'Intramurals Opening',
        date: dateFromToday(7),
        time: '08:00',
        location: 'Oval Field'
      }
    ].map(event => ({
      ...event,
      qrCreatedAt: now,
      qrExpiresAt: now + 365 * day
    }))

    localStorage.setItem('events', JSON.stringify(events))

    const students = JSON.parse(localStorage.getItem('students') || '[]')

    if (!students.length) {
      localStorage.setItem(
        'students',
        JSON.stringify([
          { name: 'Maria Santos', studentId: '2023-0101', email: 'maria@cpsu.edu.ph', faceEnrolled: true },
          { name: 'Juan Dela Cruz', studentId: '2023-0102', email: 'juan@cpsu.edu.ph', faceEnrolled: true },
          { name: 'Ana Reyes', studentId: '2023-0103', email: 'ana@cpsu.edu.ph', faceEnrolled: true }
        ])
      )
    }

    localStorage.setItem('demoSeeded', '1')
  } catch {
    // storage unavailable: the app still works, just without sample data
  }
}