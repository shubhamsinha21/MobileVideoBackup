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



/* Step-3: LOCAL PERSISTENT STORAGE (INDEXED DB) -----------------------> */

// open or create IndexedDB
const request = indexedDB.open("videoRecordingDB", 1);

// runs only once when DB is created or version changes
request.onupgradeneeded = (event) => {
  db = event.target.result;

  // object store to hold video blobs
  db.createObjectStore("videos", { keyPath: "id" });
};

// DB ready
request.onsuccess = (event) => {
  db = event.target.result;

  // load previously saved video on page load
  loadSavedVideoFromIndexedDB();
};

// error handling
request.onerror = () => {
  console.error("IndexedDB failed to open");
};

/* Step-4:  SAVE VIDEO LOCALLY --------------------------->  */

function saveVideoToIndexedDB(videoBlob) {
  if (!db) return;
  const tx = db.transaction("videos", "readwrite");
  const store = tx.objectStore("videos");

  // Overwrite latest video
  store.put({
    id: "latest-video",
    blob: videoBlob,
    savedAt: Date.now(),
  });
}


/* Step-5: LOAD SAVED VIDEO AFTER REFRESH OR REOPEN OR RELOAD  */

function loadSavedVideoFromIndexedDB() {
  if (!db) return;

  const transaction = db.transaction("videos", "readonly");
  const store = transaction.objectStore("videos");

  const request = store.get("latest-video");

  request.onsuccess = () => {
    if (request.result) {
      const videoURL = URL.createObjectURL(request.result.blob);
      savedVideo.src = videoURL;
      uploadBtn.disabled = false;
    }
  };
}


/* Step-6: MOCK UPLOAD (INTENTIONALLY FAILS) */

uploadBtn.addEventListener("click", async () => {
  alert("Uploading video... (this will fail)");

  try {
    // fake upload endpoint
    await fetch("https://example.com/upload", {
      method: "POST",
      body: recordedVideoBlob,
    });
  } catch (error) {
    alert(
      "Upload failed.\n\nVideo is still stored locally and will survive refresh."
    );
  }
});

/* Step-7: DELETE OLD VIDEO  */

if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    if (!db) return;
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");
    store.delete("latest-video");
    savedVideo.src = "";          // Remove video from UI
    uploadBtn.disabled = true;    // Disable upload
    alert("Old video deleted. You can now record a fresh one.");
  });
}



/* INIT CALL */
initCamera();