# Mobile Video Recording Feasibility Spike

## Objective

This project is a **feasibility spike** to validate whether a **mobile web app** can:

1. Record video using the device camera
2. Persist the video locally on the device (so it is not lost if upload fails)
3. Attempt an upload (mocked)
4. Demonstrate that the video is not lost even after page refresh or network failures

> This is a **proof-of-concept**, not a production solution.

---

## Features Implemented

- **Camera Access**: Opens the mobile camera using the browser.
- **Video Recording**: Records video via the `MediaRecorder` API.
- **Local Persistence**: Saves video in **IndexedDB**, ensuring it survives:
  - Page refresh
  - Tab close / browser restart
  - Failed upload
- **Mock Upload**: Simulates video upload with a fake endpoint (`example.com`) to show handling of upload failure.
- **Delete Old Video**: Optional button to remove previously recorded video before recording a new one.
- **Immediate Playback**: Saved video appears immediately after recording stops.

---

## How Local Storage Works

- **IndexedDB** is used as the storage mechanism.
- IndexedDB can store **binary blobs**, making it suitable for video files.
- Each recorded video is saved with the key `"latest-video"`.
- On page load, the app reads from IndexedDB and displays the saved video.
- This ensures **video is never lost**, even if upload fails or page is refreshed.

---

## Platform Notes

| Platform        | Notes                                                                 |
|-----------------|----------------------------------------------------------------------|
| Android Chrome  | Fully supported: camera access, MediaRecorder, IndexedDB storage    |
| iOS Safari      | Works with some limitations: MediaRecorder support may vary, storage may be cleared if OS decides (low storage or Safari purging) |

> IndexedDB behavior may differ slightly across platforms, but **core persistence works reliably** on most mobile browsers.

---

## How to Use

1. Open the app on a **mobile browser** (Android Chrome recommended).
2. Allow camera and microphone access when prompted.
3. Click **Start Recording** to record a video.
4. Click **Stop Recording** to finish.
5. The recorded video will appear in the **Saved Video** section immediately.
6. Click **Upload (Mock)** to simulate upload (this will fail intentionally).
7. Refresh the page — the video persists.
8. Optional: Click **Delete Old Video** to remove previous recording before recording a new one.

---

## Tech Stack / APIs Used

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Browser APIs**:
  - `navigator.mediaDevices.getUserMedia()` → Camera + audio
  - `MediaRecorder` → Video recording
  - `IndexedDB` → Local storage of video blob
  - `fetch()` → Mock upload simulation

> No backend required for this spike. Upload endpoint is intentionally mocked (`example.com`).

---

## Success Criteria (Assignment Requirements)

| Requirement                                                        | Status |
|------------------------------------------------------------------|--------|
| Video recorded in mobile browser                                   | ✅     |
| Video saved locally (survives refresh / upload failure)           | ✅     |
| Upload is attempted (mock)                                        | ✅     |
| Video still present after failed upload and refresh                | ✅     |
| Basic UI to demonstrate functionality                              | ✅     |

---

## How It Was Tested

- **Mobile device**: Android Chrome (main), iOS Safari (optional)
- **Scenario 1**: Record video → stop → video visible immediately → upload fails → refresh → video still exists ✅
- **Scenario 2**: Record new video → old video deleted automatically → new video appears ✅
- **Scenario 3**: Delete button clears video → fresh recording possible ✅

---

## Viability for Long-Term / Production

- This approach is feasible for **offline-first web apps** or **progressive web apps (PWA)**.
- **Pros**:
  - No native app needed
  - Offline persistence
  - Automatic handling of upload failures
- **Cons / Limitations**:
  - iOS storage may be purged by the OS
  - No background upload or queue management
  - Limited UI/UX for production use

> For production, a backend service + PWA enhancements would be needed.

---

## Folder Structure

video-spike/
- ├── index.html # Main HTML file
- ├── style.css # Minimal styling
- ├── app.js # JavaScript logic (camera, recording, IndexedDB, upload)
- └── README.md # This explanation


---

## Notes for Reviewers

- **Upload is mocked intentionally**; focus is on **local persistence and handling failures**.
- The spike demonstrates that **mobile browsers can record and persist video locally** without losing it.
- This is sufficient to meet the **assignment objective**.

---

## Author

- Shubham Sinha
