# JONY KIDS OLIMPIADASI — 20s motion (vizavi-motion)

Format: 1920x1080, 60 fps, H.264 yuv420p, AAC 48k. 120 BPM (1 bar = 2 s). 5 scenes x 4 s (= 2 bars).
24s script compressed proportionally to the requested 20 s. Voice-over not recorded (no TTS/voice provided) —
on-screen text carries the script; music + SFX are synthesized.

Thread ("Bilim zinapoyasi"): the hero Jony (yellow Kenney shape character) hits a knowledge "!" block -> the
challenge appears -> friends climb the staircase of knowledge -> at the top a door opens -> gifts for everyone ->
through the door into the prize hall -> price sign + call to action. Every scene is caused by the previous one.

Planes: sky gradient / far hills+big clouds (z 2600-3400) / pale Kenney trees (z 1500-2000) / action plane
(z 1000: tiles, characters, door, text) / foreground blurred clouds, coins, confetti (z 250-600).
Camera: one continuous Hermite spline (x, y, z, roll) per world; DOF by depth; motion blur = 5-subframe
accumulation (180 deg shutter); soft drop shadows (paper-cut) + Kenney contact shadows.

## S1 HOOK 0.0-4.0 — "BILIMINGIZNI SINANG!"
Variants: (a) hero head-butts "!" block, letters burst out & land like blocks; (b) question-mark balloon pops;
(c) chalk writes on board; (d) gears inside a head. **Chosen (a)**: physical cause for the text, sets the game-world.
- 0.0 camera low & close, foreground clouds slide past, dolly back + rise, roll -4 -> 0.
- 0.35 squash, 0.55 jump, 0.75 hits block (SFX bonk + coin), letters of BILIMINGIZNI spray up and fall into
  a line (land 1.0-1.55, squash on contact, pop SFX). 2.0 (downbeat) "SINANG!" slams in with overshoot.
- 2.2-3.5 reading hold: slow arc. 3.5-4.0 whip right/up (motion blur) -> S2.

## S2 OLIMPIADA 4.0-8.0 — "JONY KIDS OLIMPIADASI"
Variants: (a) friends hop up a staircase of tiles while title stacks behind them; (b) torch relay;
(c) medal flips into title; (d) podium rises from ground. **Chosen (a)**: continues the game world, adds the
"all kids participate" idea, motivates diagonal camera.
- Camera tracks diagonal up-right, roll +2. Five friends hop step-by-step on eighth notes.
- 4.5-5.3 "JONY KIDS" letters pop from behind mid-far plane (parallax vs characters), multicolor.
- 5.6 ribbon unfurls with "OLIMPIADASI". Hold to 7.3. 7.3-8.0 pan to the door at the top.

## S3 SOVG'ALAR 8.0-12.0 — "BARCHA ISHTIROKCHILARGA SOVG'ALAR!"
Variants: (a) door at top opens, warm light, gifts fly to each child; (b) giant gift box unwraps; (c) gifts rain
from clouds; (d) conveyor of presents. **Chosen (a)**: uses the requested opening door; reveals = reward.
- 8.25/8.5 knocks, 8.75-9.5 door swings open on hinge (perspective, overshoot), light beams.
- 9.3-10.2 gift boxes arc out to each character; catch + bounce. Text pops 9.6/10.0. Hold to 11.2.
- 11.2-12.0 camera dollies into the doorway; the prize hall appears INSIDE the door opening (real mask) -> S4.

## S4 KATTA MUKOFOTLAR 12.0-16.0 — "VELOSIPED | KOPTOK | IPHONE 17 PRO MAX"
Variants: (a) three podiums in depth, prizes land one per beat while camera trucks laterally; (b) slot machine;
(c) prize carousel; (d) prizes inside gift boxes. **Chosen (a)**: clean readability, strong parallax.
- 12.4 bicycle drops on podium (thud), 13.4 ball bounces in (boing), 14.4 phone rises glowing (shimmer).
- Labels attach to each prize anchor. 15.0-15.55 all held. 15.55-16.0 tilt-up whip -> S5.

## S5 NARX + CTA 16.0-20.0 — "ATIGI 25 000 SO'M" / "HOZIROQ RO'YXATDAN O'TING!"
Variants: (a) price sign drops on ropes and swings, kids cheer, CTA button pressed by Kenney hand;
(b) coin stack builds number; (c) price stamped on ticket; (d) scoreboard flips. **Chosen (a)**: weight & reaction,
ends on a calm readable frame.
- 16.0 camera tilts down from sky (continues whip), sign drops 16.1, damped swing.
- 17.5 CTA pill slides up; 18.4 hand taps (click), pulse. 18.6-20 gentle drift, final chord tail.
