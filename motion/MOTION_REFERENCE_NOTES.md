# Motion reference notes (what made the reference videos work)

These notes come from frame-by-frame analysis of the two 9:16 reference videos the client sent (2026-11).
They describe the logic to reuse, not a template to copy.

## Colour
- Calm base: white / very light grey background, plus **one** accent colour (teal/cyan or coral). No rainbow palettes.
- Dark ink (near-black navy) for body text; the accent is used for one word or one shape per frame.
- Soft radial glows (accent at 10–18 % opacity) behind the focal word. Thin outline circles/arcs as decoration.

## Hook typography
- The first word arrives with a **zoom-blur**: it starts large and blurred, then settles in about 0.5–0.7 s (eased with eOut5).
- Phrases build word-by-word or letter-by-letter. Each glyph rises a little and goes from blurred to sharp.
- Scale contrast inside one phrase: a small setup line ("they have the") and a huge payoff word ("**power**").
- Mixed type voices: bold grotesk for statements, *italic serif* in the accent colour for the emotional word,
  sometimes a script word.
- Emphasis devices: a highlight block behind a word (the text flips to white), an outline box, an underline sweep,
  or a hand-drawn oval stroke drawn around the key value.

## Motion and camera
- Nothing freezes. During a hold the camera still makes a slow push-in, a 1–2° rotation or a lateral drift,
  and decor layers move with parallax.
- A new element lands roughly every 0.5–1.0 s. Scenes last 2–4 s.
- Every frame has a **different layout**: a centred word, an icon infographic with connector lines and labels,
  pill tags appearing one by one, a progress ring or counter, a product hero and a logo end card.

## Transitions (smooth, motivated)
- **Shape match:** a shape from scene A (highlight pill, circle) grows to fill the screen and becomes scene B's background.
- **Whip pan** with strong directional motion blur between scenes of different colour.
- **Zoom-through:** push into the hero object until it fills the frame, then release into the next scene.
- **Circle wipe** from the hero object's centre.
- Motion blur appears only on fast moves. Accumulate sub-frames (3 samples normally, 7 during transitions).

## Production notes
- Pre-render 3D props once as turntable sprites (72 angles, alpha). Compositing them in 2D keeps a full
  1080×1920 60 fps render to minutes instead of an hour of software WebGL.
- Sync SFX to the visual events (landings, sweeps, counter ticks, clicks). The music stays minimal and modern:
  pads, soft keys, sub bass, a light groove, with a final chord on the CTA press.
