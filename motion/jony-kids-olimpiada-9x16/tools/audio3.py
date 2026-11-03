# v2 score: modern minimal electronic (not toy-like), 120 BPM, A minor / C (vi-IV-I-V), synced to v2 visuals
import numpy as np, wave, sys
SR = 48000; DUR = 20.0; N = int(SR * DUR) + SR
rs = np.random.RandomState(11)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); send = np.zeros((N, 2))

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def add(buf, t, sig, gain=1.0, pan=0.0, rev=0.0):
    i = int(round(t * SR)); n = min(len(sig), N - i)
    if n <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:i + n, 0] += sig[:n] * gain * l; buf[i:i + n, 1] += sig[:n] * gain * r
    if rev: send[i:i + n, 0] += sig[:n] * gain * rev * l; send[i:i + n, 1] += sig[:n] * gain * rev * r
def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H *= 1 / np.sqrt(1 + (f / hi) ** order)
    if lo: H *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** order)
    return np.fft.irfft(X * H, len(x))
def svf_sweep(x, f0, f1, q=.8, mode='band'):
    out = np.zeros_like(x); low = band = 0.0; n = len(x)
    for i in range(n):
        fc = f0 * (f1 / f0) ** (i / n); fq = 2 * np.sin(np.pi * min(fc, SR / 6) / SR)
        high = x[i] - low - q * band; band += fq * high; low += fq * band; out[i] = band if mode == 'band' else low
    return out
def saw(f, n, det=(0,), ph=None):
    t = np.arange(n) / SR; s = np.zeros(n)
    for d in det:
        ff = f * 2 ** (d / 1200); s += 2 * ((t * ff + rs.rand()) % 1) - 1
    return s / len(det)

# ---------- instruments ----------
def kick():
    n = int(.5 * SR); t = np.arange(n) / SR; f = 45 + 95 * np.exp(-t / .03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .22); s[:150] += rs.randn(150) * .15
    return np.tanh(s * 1.4) * .8
def clap():
    n = int(.35 * SR); x = filt(rs.randn(n), 1000, 6000); t = np.arange(n) / SR; e = np.zeros(n)
    for d in (0, .009, .018): e += (t >= d) * np.exp(-np.maximum(t - d, 0) / (.008 if d < .018 else .12))
    return x * e * .4
def hat(o=False):
    n = int((.25 if o else .05) * SR); x = filt(rs.randn(n), 8000); t = np.arange(n) / SR
    return x * np.exp(-t / (.07 if o else .015)) * .22
def keys(m, dur=1.0, g=.12):  # soft FM e-piano
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    mod = np.sin(2 * np.pi * f * t) * 1.2 * np.exp(-t / .4)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t / .9) * np.minimum(1, t / .004) * g
def pluck(m, dur=.4, g=.14, cut=2600):
    n = int(dur * SR); t = np.arange(n) / SR; s = saw(mtof(m), n, (-8, 8))
    s = filt(s, None, cut, 2) * np.exp(-t / .12) * np.minimum(1, t / .002); return s * g
def sub(m, dur, g=.19):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)
    e = np.minimum(1, t / .006) * np.minimum(1, (dur - t) / .03); return np.tanh(s * 1.2) * e * g
def pad(ms, dur, g=.05, cut=1800):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms: s += saw(mtof(m), n, (-12, 0, 11))
    s = filt(s, 120, cut, 2); e = np.minimum(1, t / .5) * np.minimum(1, (dur - t) / .5); return s * e * g / len(ms)
def riser(dur, g=.25):
    n = int(dur * SR); x = rs.randn(n); y = svf_sweep(x, 300, 7000, .6); t = np.arange(n) / SR
    return y * (t / dur) ** 2 * g / (np.abs(y).max() + 1e-9)
def impact(g=.6):
    n = int(1.4 * SR); t = np.arange(n) / SR; f = 38 + 60 * np.exp(-t / .05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .5) + filt(rs.randn(n), 200, 3000) * np.exp(-t / .08) * .4
    return np.tanh(s) * g

CH = {'Am': [57, 60, 64, 67], 'F': [53, 57, 60, 64], 'C': [55, 60, 64, 67], 'G': [55, 59, 62, 66 - 0]}
CH['G'] = [55, 59, 62, 67]
ROOT = {'Am': 33, 'F': 29, 'C': 36, 'G': 31}
prog = [(0, 2, 'Am'), (2, 4, 'F'), (4, 6, 'C'), (6, 8, 'G'), (8, 10, 'Am'), (10, 12, 'F'), (12, 14, 'C'), (14, 16, 'G'), (16, 18, 'Am'), (18, 20, 'F')]

# pads (whole piece) + e-piano chord hits
for a, b, c in prog:
    if a < 18: add(mus, a, pad(CH[c], b - a + .4, .11 if a < 2 else .05, 1200 if 8 <= a < 9 else 2200), 1, 0, .5)
add(mus, 18.65, pad([41, 53, 57, 60, 64, 72], 1.6, .08, 3000), 1, 0, .8)
for a, b, c in prog:
    if a >= 18: continue
    for k, off in enumerate((0, .75, 1.5)):
        if a < 2 and k: continue
        for m in CH[c]: add(mus, a + off, keys(m + 12, .9, .045), 1, (-.2 if k % 2 else .2), .4)
add(mus, 18.65, sum(np.pad(keys(m + 12, 1.5, .06), (0, 0)) for m in [53, 57, 60, 64]), 1, 0, .7)

# intro arp (0-2) filtered pluck, opening up
arp = [69, 72, 76, 79, 76, 72, 76, 81]
for i, m in enumerate(arp): add(mus, i * .25, pluck(m, .5, .22, 1100 + i * 300), 1, -.3 if i % 2 else .3, .45)

# drums
def drums(a, b):
    t = a
    while t < b - 1e-6:
        beat = round((t - a) / .5)
        add(mus, t, filt(kick(), 30), .6)
        if beat % 2 == 1: add(mus, t, clap(), 1, .05, .3)
        add(mus, t + .25, hat(beat % 4 == 3), 1, .25)
        add(mus, t + .125, hat(), .45, -.3); add(mus, t + .375, hat(), .55, -.3)
        t += .5
drums(2, 10.5); drums(11.5, 18)
# sub bass (8ths, sidechain-feel by short notes)
for a, b, c in prog:
    if a < 2 or a >= 18: continue
    t = a
    while t < b - 1e-6:
        if not (10.5 <= t < 11.5): add(mus, t + .03, sub(ROOT[c] + 12, .2), 1)
        t += .25
add(mus, 18.65, sub(29 + 12, 1.3, .35), 1)
# pluck hook (sparse, mature): bars 4-8 and 12-18
hook = [(0, 76), (.5, 79), (.75, 81), (1.25, 79), (1.5, 76)]
for a in (4, 6, 12, 14, 16):
    for off, m in hook: add(mus, a + off, pluck(m, .45, .1, 3200), 1, .15, .5)
# transitions
add(mus, 2.0, impact(.5), 1); add(mus, 18.65, impact(.45), 1)
add(mus, 1.0, riser(1.0, .14), 1, 0, .3); add(mus, 10.5, riser(1.5, .18), 1, 0, .3); add(mus, 7.0, riser(1.0, .16), 1, 0, .3)

# ---------- SFX (matched to v2 visual events) ----------
def whoosh(dur, f0, f1, g=.4):
    n = int(dur * SR); y = svf_sweep(rs.randn(n), f0, f1, .9); t = np.arange(n) / SR
    return y * np.sin(np.pi * t / dur) ** 2 * g / (np.abs(y).max() + 1e-9)
def tap(f=900, g=.25, d=.04):  # soft glossy contact
    n = int(.25 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / d) + filt(rs.randn(n), 1500, 7000) * np.exp(-t / .004) * .3) * g
def thud(g=.4):
    n = int(.35 * SR); t = np.arange(n) / SR; f = 90 + 60 * np.exp(-t / .02)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .07) + filt(rs.randn(n), 150, 1500) * np.exp(-t / .02) * .4) * g
def tick(g=.12): n = int(.03 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * 3200 * t) * np.exp(-t / .004) * g
def shimmer(dur=1.0, g=.06):
    out = np.zeros(int((dur + 1) * SR))
    for i, m in enumerate([81, 84, 88, 91, 93, 96]):
        s = keys(m, .9, g); i0 = int(i * dur / 7 * SR); out[i0:i0 + len(s)] += s
    return out
def click(): n = int(.05 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 1500 * t) * np.exp(-t / .008) + rs.randn(n) * np.exp(-t / .002) * .3) * .4

add(sfx, 0.0, whoosh(.75, 3000, 300, .3), 1, 0, .4)                      # zoom-blur arrival
for i in range(7): add(sfx, .75 + i * .07, tap(900 + i * 60, .12, .03), 1, -.4 + i * .13, .3)   # sinang! letters
add(sfx, .9, whoosh(.9, 250, 1400, .18), 1, .2, .3)                       # ? rises
add(sfx, 1.85, whoosh(.45, 600, 4000, .25), 1, -.3, .2)                   # highlight sweep
for i in range(5): add(sfx, 2.3 + i * .07, tick(.05), 1, -.3 + i * .15)
add(sfx, 3.0, whoosh(.5, 300, 6000, .35), 1, 0, .3); add(sfx, 3.5, impact(.45), 1)   # pill fills screen
add(sfx, 3.58, whoosh(.6, 2500, 400, .2), 1, 0, .3)                       # medal drops
for i in range(11): add(sfx, 3.72 + i * .04, tick(.04), 1, -.5 + i * .1)
add(sfx, 5.0, shimmer(.5, .025), 1, 0, .5)
add(sfx, 7.0, whoosh(.5, 400, 5000, .45), 1, -.6, .2)                     # whip pan
add(sfx, 8.13, thud(.5), 1, 0, .3)                                        # gift lands
for i in range(10): add(sfx, 7.95 + i * .035, tick(.04), 1, -.4 + i * .09)
add(sfx, 8.55, whoosh(.45, 800, 3500, .18), 1, .2, .2)                    # underline
for td, pn in ((8.75, -.4), (9.1, .4)): add(sfx, td, whoosh(.35, 1500, 5000, .08), 1, pn); add(sfx, td + .25, tap(700, .22, .04), 1, pn, .3)
add(sfx, 10.7, riser(.5, .25), 1, 0, .3); add(sfx, 10.9, whoosh(.35, 300, 7000, .35), 1, 0, .3)
add(sfx, 11.2, impact(.5), 1); add(sfx, 11.35, whoosh(.5, 600, 2000, .15), 1, 0, .3)
for t0 in (12.65, 14.1): add(sfx, t0 - .05, whoosh(.45, 300, 3500, .35), 1, 0, .2); add(sfx, t0 + .35, thud(.25), 1)
add(sfx, 14.4, shimmer(.8, .04), 1, 0, .6)
add(sfx, 15.2, whoosh(.45, 300, 5000, .35), 1, 0, .3); add(sfx, 15.6, whoosh(.45, 5000, 500, .25), 1, 0, .3)
k = 0; tt = 16.3
while tt < 17.25: add(sfx, tt, tick(.06), 1, (k % 2 - .5) * .3); u = (tt - 16.3) / .95; tt += .03 + .12 * u ** 2; k += 1
add(sfx, 17.25, tap(520, .25, .05), 1, 0, .3)
n = int(.6 * SR); scr_ = filt(rs.randn(n), 1500, 6000) * (0.5 + 0.5 * np.sin(np.arange(n) / SR * 2 * np.pi * 9)) * np.sin(np.pi * np.arange(n) / n) * .08
add(sfx, 17.35, scr_, 1, 0, .2)                                           # marker stroke
add(sfx, 17.9, whoosh(.35, 500, 2200, .2), 1); add(sfx, 18.1, tap(800, .2, .04), 1, 0, .3)
add(sfx, 18.65, click(), 1, .2); add(sfx, 18.68, tap(1200, .2, .03), 1, .2, .5)
add(sfx, 19.0, shimmer(.6, .03), 1, 0, .6)
# ---------- mix ----------
def reverb(x, secs=1.8):
    n = int(secs * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for c in range(2):
        ir = filt(rs.randn(n) * np.exp(-t / (secs / 5)), 250, 6000); ir /= np.sqrt((ir ** 2).sum())
        L = len(x) + n; nf = 1 << (L - 1).bit_length(); out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], nf) * np.fft.rfft(ir, nf), nf)[:len(x)]
    return out
mix = (mus * .7 + sfx * .9 + reverb(send) * .35)[:int(DUR * SR)]
fo = int(.4 * SR); mix[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]; mix[:240] *= np.linspace(0, 1, 240)[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3); mix *= 10 ** (-1 / 20) / np.abs(mix).max()
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
x = mix.mean(1)
for s in (1, 5, 8, 13, 19):
    seg = x[s * SR:(s + 1) * SR]; S = np.abs(np.fft.rfft(seg)); f = np.fft.rfftfreq(len(seg), 1 / SR)
    b = lambda a, c: 10 * np.log10((S[(f >= a) & (f < c)] ** 2).sum() + 1e-9)
    print(s, 'sub %.0f low %.0f mid %.0f hi %.0f' % (b(20, 120), b(120, 500), b(500, 3000), b(3000, 12000)))
print('peak', np.abs(mix).max())
