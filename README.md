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