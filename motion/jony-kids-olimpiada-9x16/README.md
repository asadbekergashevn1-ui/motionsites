# JONY KIDS OLIMPIADASI — 9:16 v3 (minimal kinetic typography + 3D accents)

`jony_kids_olimpiada_9x16_v3.mp4`: 1080x1920, 60 fps, H.264 yuv420p, AAC 48 kHz, 20.000 s (1200 frames).
Brand colours white + cyan (#00AEEF), ink #0F1F2A. Fonts: Inter Display (OFL) and Instrument Serif Italic (OFL).
Logic follows `../MOTION_REFERENCE_NOTES.md`.

Scenes:
1. 0–3.5 s. "Bilimingizni" lands with a zoom-blur, *sinang!* follows. A highlight pill fills the screen.
2. 3.5–7.5 s. JONY KIDS OLIMPIADASI on cyan, with a swinging medal, then a whip pan.
3. 7.5–11.2 s. SOVG‘ALAR! with the gift and infographic pills, then a zoom-through.
4. 11.2–15.6 s. Prize carousel (Velosiped / Koptok / iPhone 17 Pro Max) with a progress ring, then a circle wipe.
5. 15.6–20 s. The price counter runs to 25 000 so‘m, the oval stroke draws, and the cursor presses the CTA.

Re-render (about 2.5 min with 4 processes):
1. In this folder: `python3 -m http.server 8767`
2. `node tools/render3.js frames 0 1200 0 1` (0 = adaptive motion-blur samples)
3. `python3 tools/audio3.py mix.wav`
4. `ffmpeg -framerate 60 -i frames/f_%05d.png -i mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac out.mp4`

The 3D props in `sprites/` (72-angle turntables) come from the Three.js scene in `3d/` (`npm i` in `3d/`,
serve it on port 8766, then run `node tools/sprites.js sprites`). No voice-over is included: the on-screen text carries the script.
