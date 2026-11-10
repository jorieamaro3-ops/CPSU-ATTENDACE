// Face matching for check-in, runs fully in the browser using face-api.js.
// Models are loaded from a CDN the first time, so no files to download.

const MODEL_URL =
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'

// Lower = stricter. 0.6 is the library default; 0.5 reduces false matches.
const MATCH_THRESHOLD = 0.5

let faceapi = null
let loading = null

export function loadFaceModels() {
  if (!loading) {
    loading = (async () => {
      faceapi = await import('@vladmandic/face-api')
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ])
    })().catch(err => {
      loading = null // allow retry
      throw err
    })
  }
  return loading
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function describe(input) {
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5
  })

  return faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks()
    .withFaceDescriptor()
}

/**
 * enrolledPhoto: data URL saved at registration
 * liveInput: <video> or <canvas> with the live camera frame
 * returns { matched, distance, reason }
 */
export async function matchFaces(enrolledPhoto, liveInput) {
  await loadFaceModels()

  const enrolledImg = await loadImage(enrolledPhoto)

  const [enrolled, live] = await Promise.all([
    describe(enrolledImg),
    describe(liveInput)
  ])

  if (!enrolled) {
    return {
      matched: false,
      reason: 'Your registered photo has no clear face. Please re-register with a clearer photo.'
    }
  }

  if (!live) {
    return {
      matched: false,
      reason: 'No face detected. Center your face in the frame with good lighting.'
    }
  }

  const distance = faceapi.euclideanDistance(
    enrolled.descriptor,
    live.descriptor
  )

  return {
    matched: distance < MATCH_THRESHOLD,
    distance,
    reason: distance < MATCH_THRESHOLD ? '' : 'Face did not match. Please try again.'
  }
}