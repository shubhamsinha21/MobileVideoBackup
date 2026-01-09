/* ------------------- GLOBAL STATE --------------------- */

// mediaRecorder instance (handles recording)
let mediaRecorder;

// temporary in-memory chunks during recording
let recordedChunks = [];

// final recorded video blob
let recordedVideoBlob = null;

// indexedDB reference
let db = null;

// DOM elements
const preview = document.getElementById("preview");
const savedVideo = document.getElementById("savedVideo");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const uploadBtn = document.getElementById("uploadBtn");
const deleteBtn = document.getElementById("deleteBtn");

/* Step -1: OPEN CAMERA & SET UP MEDIA RECORDER ------------------>  */

async function initCamera() {
  try {
    // requesting camera + microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // show live camera feed
    preview.srcObject = stream;

    // Initialize MediaRecorder
    mediaRecorder = new MediaRecorder(stream);

    // collect recorded data chunks
    mediaRecorder.ondataavailable = (event) => {
      recordedChunks.push(event.data);
    };

    // when recording stops, create final video Blob
    mediaRecorder.onstop = () => {
      recordedVideoBlob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      // reset chunks for next recording
      recordedChunks = [];

      // Persist video locally
      saveVideoToIndexedDB(recordedVideoBlob);

      // show immediately in UI without refresh
      const url = URL.createObjectURL(recordedVideoBlob);
      savedVideo.src = url;

      uploadBtn.disabled = false;
    };
  } catch (err) {
    alert("Camera access failed");
    console.error(err);
  }
}

/* Step-2: RECORDING CONTROLS --------------------------> */

// auto-delete old video when starting a new recording
startBtn.addEventListener("click", () => {
  if (db) {
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");
    store.delete("latest-video"); // Clear old video
    savedVideo.src = ""; // Clear UI
    uploadBtn.disabled = true; // Disable upload for fresh recording
  }
  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
});