# JONY KIDS OLIMPIADASI — 20 s motion

`jony_kids_olimpiada_20s.mp4` — 1920x1080, 60 fps, H.264 yuv420p, AAC 48 kHz stereo, 20.000 s (1200 frames).

Built from `index.html`: a deterministic 2.5D canvas timeline with a depth-sorted camera (parallax), DOF by depth,
5-sample/4-sample motion blur and soft shadows. See `STORYBOARD.md` for the shot plan.

Re-render:
1. `python3 -m http.server 8765` (in this folder)
2. `node tools/render.js frames 0 1200 4` (Playwright; writes PNG frames)
3. `python3 tools/audio.py mix.wav` (music + SFX synthesized with numpy)
4. `ffmpeg -framerate 60 -i frames/f_%05d.png -i mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k out.mp4`

Assets: Kenney "Shape Characters" 1.0 (CC0, see img/KENNEY_LICENSE.txt); fonts Baloo 2 and Fredoka (SIL OFL, Google Fonts).
Bicycle, ball, phone, door, gifts, sign are drawn in code. No voice-over (on-screen text only).
