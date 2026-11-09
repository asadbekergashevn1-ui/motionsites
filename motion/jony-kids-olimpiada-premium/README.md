# JONY KIDS OLIMPIADASI — premium 2.5D, 9:16 (vizavi-motion + premium-visual-art-director)

`jony_kids_olimpiada_premium_9x16.mp4`: 1080x1920, 60 fps, H.264 yuv420p, AAC 48 kHz, 20.000 s.

Visual system: one key light from the upper left. Satin-ceramic white surfaces carry glossy cyan accents.
Every panel has visible thickness, and contact shadows plus AO sit under each hero. The hero objects are 3D
(1024 px turntables with 240 angles and sub-angle interpolation, so they rotate smoothly).

| Scene | Previous issue | Upgrade | Verification |
|---|---|---|---|
| 0–3.5 Intro | flat open backdrop, small floating icons | Archetype A: diagonal architectural slabs; 3D "?" on a ceramic plinth; dimensional *sinang!* pill | stills 0.4/2.6, contact sheet |
| 3.5–7.5 Medal | simple flat medal on cyan | Archetype B/D: three bevelled sculpted rings at different depths, a studio light sweep, a 3D medal | stills 4.4/6.0 |
| 7.5–11.2 Gifts | door-like box, basic gifts | Archetype C+D: thick arch portal, two-tier podium, a hero gift with two companions, zoom-through into the gift | stills 8.6/9.9/11.0 |
| 11.2–15.6 Prizes | three identical flat cards | Archetype E: one exhibit system with three variants (capsule podium + ribbon, spotlight pedestal, frosted frame + plinth) | stills 12.2/13.6/15.0 |
| 15.6–20 Offer | stacked UI cards | Archetype A bookend: thick architectural frame, dimensional CTA that compresses when pressed | stills 17.0/19.6 |

Re-render: `python3 -m http.server 8769` in this folder → `node tools/render5.js frames 0 1200 0 1` →
`python3 tools/audio5.py mix.wav` → mux with ffmpeg. Sprites come from `3d/sprites1k.html`
(the Three.js scene from `../jony-kids-olimpiada-9x16/3d`).
