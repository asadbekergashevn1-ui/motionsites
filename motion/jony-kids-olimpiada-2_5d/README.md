# JONY KIDS OLIMPIADASI — 2.5D, 9:16

`jony_kids_olimpiada_2_5d_9x16.mp4`: 1080x1920, 60 fps, H.264 yuv420p, AAC 48 kHz, 20.000 s.

Flat vector elements (paper card, pencil, ?, medal, door, gifts, bicycle, ball, phone, price card, CTA) sit on
several depth planes: far 0.25, dots 0.45, mid 0.7–0.9, hero 1.0, near 1.1–1.6. The camera drifts, zooms and rolls
gently, and each plane follows it by its own parallax factor. Soft drop shadows grow with a plane's elevation,
and the nearest specks are blurred. White + cyan brand. The text follows the script; the motion logic follows
`../MOTION_REFERENCE_NOTES.md`.

Re-render: in this folder run `python3 -m http.server 8768`, then `node tools/render4.js frames 0 1200 0 1`,
then `python3 tools/audio4.py mix.wav`, then mux both with ffmpeg (see the other README).
