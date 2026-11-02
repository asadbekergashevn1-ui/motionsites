# Music + SFX for JONY KIDS 20s spot. 120 BPM, C major, synced to visual events in index.html
import numpy as np, wave, sys
SR = 48000; DUR = 20.0; N = int(SR * DUR) + SR  # +1s headroom, trimmed later
rs = np.random.RandomState(7)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); verb_send = np.zeros((N, 2))
BEAT = 0.5

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_ad(n, a, d_tau):
    t = np.arange(n) / SR; e = np.exp(-t / d_tau)
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na); return e
def add(buf, t, sig, gain=1.0, pan=0.0, send=0.0):
    i = int(round(t * SR));
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    if n <= 0: return
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += sig[:n] * gain * l * 1.414; buf[i:i + n, 1] += sig[:n] * gain * r * 1.414
    if send: verb_send[i:i + n, 0] += sig[:n] * gain * send * l; verb_send[i:i + n, 1] += sig[:n] * gain * send * r
def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); H = np.ones_like(f)
    if hi: H *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo: H *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X * H, len(x))
def sweep_filter(x, f0, f1, q=0.7):
    # time-varying state-variable bandpass (per-sample loop; short signals only)
    out = np.zeros_like(x); low = band = 0.0; n = len(x)
    for i in range(n):
        fc = f0 * (f1 / f0) ** (i / n); fq = 2 * np.sin(np.pi * min(fc, SR / 6) / SR)
        high = x[i] - low - q * band; band += fq * high; low += fq * band; out[i] = band
    return out

# ---------------- instruments ----------------
def kick(g=1.0):
    n = int(.42 * SR); t = np.arange(n) / SR
    f = 48 + 120 * np.exp(-t / .035); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / .16); s[:int(.004 * SR)] += rs.randn(int(.004 * SR)) * .3
    return np.tanh(s * 1.6) * g
def clap():
    n = int(.3 * SR); x = rs.randn(n); x = fft_filter(x, 900, 5000)
    e = np.zeros(n); t = np.arange(n) / SR
    for d in (0, .011, .022): e += (t >= d) * np.exp(-np.maximum(t - d, 0) / (.009 if d < .02 else .09))
    return x * e * .55
def hat(open_=False):
    n = int((.22 if open_ else .06) * SR); x = fft_filter(rs.randn(n), 7000, None)
    return x * env_ad(n, .001, .08 if open_ else .018) * .32
def shaker():
    n = int(.09 * SR); x = fft_filter(rs.randn(n), 5000, 12000); return x * env_ad(n, .02, .025) * .18
def crash():
    n = int(2.2 * SR); x = fft_filter(rs.randn(n), 3500, None); return x * env_ad(n, .002, .7) * .3
def marimba(m, dur=.7, g=.3):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / .38) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / .05) + .12 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t / .02)
    s *= np.minimum(1, t / .002); return s * g
def bell(m, dur=.9, g=.22):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t / .15)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / .35) * np.minimum(1, t / .003); return s * g
def pluck(m, dur=.35, g=.25):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m); s = np.zeros(n)
    for h in range(1, 7): s += np.sin(2 * np.pi * f * h * t) / h * np.exp(-t * (6 + h * 5))
    return s * g * np.minimum(1, t / .002)
def bass(m, dur, g=.27):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m); s = np.zeros(n)
    for h in range(1, 9): s += np.sin(2 * np.pi * f * h * t) / h * (0.85 ** h)
    e = np.minimum(1, t / .004) * np.exp(-t / .25) * .7 + .3; e *= np.minimum(1, (dur - t) / .02)
    return np.tanh(s * 1.3) * e * g
def pad(ms, dur, g=.08):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for m in ms:
        for det in (-.12, .0, .11):
            f = mtof(m + det)
            for h in range(1, 6): s += np.sin(2 * np.pi * f * h * t + rs.rand() * 6) / h ** 1.4
    e = np.minimum(1, t / .35) * np.minimum(1, (dur - t) / .4); return s * e * g / len(ms)

# ---------------- arrangement ----------------
CH = {'C': [60, 64, 67], 'G': [59, 62, 67], 'Am': [57, 60, 64], 'F': [57, 60, 65]}
ROOT = {'C': 36, 'G': 43, 'Am': 45, 'F': 41}
# (start, end, chord)
prog = [(0, 2, 'C'), (2, 4, 'F'), (4, 6, 'C'), (6, 8, 'G'), (8, 10, 'Am'), (10, 12, 'F'), (12, 14, 'C'), (14, 16, 'G'), (16, 17, 'F'), (17, 18, 'G'), (18, 20, 'C')]
for a, b, c in prog:
    if a < 18: add(mus, a, pad(CH[c] + [CH[c][0] + 12], b - a + .3), .9, 0, .6)
add(mus, 18.5, pad([48, 60, 64, 67, 72, 76], 1.6), 1.6, 0, .9)

# intro arpeggio 0-2 (sparkly pluck, rising) + 2-4 (F)
arp = [60, 64, 67, 72, 67, 64, 67, 72]
for i in range(8): add(mus, i * .25, pluck(arp[i] + 12, .4, .18), 1, (-.4 if i % 2 else .4), .4)
for i in range(8): add(mus, 2 + i * .25, pluck([65, 69, 72, 77, 72, 69, 72, 77][i] + 12, .4, .16), 1, (-.4 if i % 2 else .4), .4)

def drums(a, b, full=True, fill_end=False):
    t = a
    while t < b - 1e-6:
        beat = round((t - a) / BEAT)
        add(mus, t, fft_filter(kick(), 35, None), .55)
        if beat % 2 == 1 and full: add(mus, t, clap(), .9, .05, .25)
        add(mus, t + .25, hat(open_=(beat % 2 == 1)), .9, .3)
        add(mus, t, hat(), .6, -.3)
        t += BEAT
    if fill_end:
        for k, d in enumerate([.125, .25, .375]): add(mus, b - .5 + d, clap(), .5 + k * .15, (-.3 + k * .3), .2)
drums(2, 8, True, fill_end=True)            # S1 slam -> S2 groove
for k in range(4): add(mus, 8 + k * .5, shaker(), 1, .2)  # breakdown 8-9 (knocks)
drums(9, 18, True)                           # back in as the door opens
add(mus, 0.75, kick(.8), 1)
# bass line (8ths with octave bounce)
for a, b, c in prog:
    if a < 2 or a >= 18: continue
    r = ROOT[c]; t = a
    while t < b - 1e-6:
        k = round((t - a) / .25); m = r + (12 if k % 4 == 2 else 0)
        if not (8 <= t < 9): add(mus, t, bass(m, .24), 1)
        t += .25
add(mus, 18.5, bass(36, 1.4, .5), 1)
# marimba offbeat stabs
for a, b, c in prog:
    if a < 4 or a >= 18 or a == 8: continue
    t = a + .25
    while t < b:
        for m in CH[c]: add(mus, t, marimba(m + 12, .35, .09), 1, .25, .2)
        t += .5
# melody (bell): climbing motif on the leader's landings 4.5..7.0 + answer
climb = [(4.5, 72), (5.0, 74), (5.5, 76), (6.0, 79), (6.5, 81), (7.0, 84), (7.5, 83), (7.75, 79)]
for t, m in climb: add(mus, t, bell(m), 1, -.15, .5)
mel = {10: [77, 76, 72, None, 72, 74, 76, 77], 12: [79, None, 76, 79, 84, None, 79, None], 14: [83, None, 81, 79, 81, None, 79, 74], 16: [77, 81, 84, None, 83, 81, 79, 83]}
for a, notes in mel.items():
    for i, m in enumerate(notes):
        if m: add(mus, a + i * .25, bell(m, .8, .17), 1, .1, .5)
add(mus, 18.5, bell(84, 1.5, .22), 1, 0, .8); add(mus, 18.5, bell(88, 1.5, .14), 1, .2, .8); add(mus, 18.5, bell(91, 1.5, .1), 1, -.2, .8)
for t in (2.0, 4.0, 9.0, 12.0, 18.5): add(mus, t, crash(), 1 if t != 18.5 else 1.2, .1, .3)

# ---------------- SFX ----------------
def whoosh(dur, f0, f1, g=.5):
    n = int(dur * SR); x = rs.randn(n); y = sweep_filter(x, f0, f1, .9)
    t = np.arange(n) / SR; e = np.sin(np.pi * t / dur) ** 2; return y * e * g / (np.abs(y).max() + 1e-9)
def bonk():  # head hits block
    n = int(.35 * SR); t = np.arange(n) / SR; f = 520 * np.exp(-t / .2) + 260
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .08) + .3 * np.sin(2 * np.pi * 1300 * t) * np.exp(-t / .03)
    return s * .5
def coin():
    s = np.concatenate([bell(88, .08, .5)[:int(.08 * SR)], bell(95, .5, .5)]); return s * .7
def pop(m=84, g=.35):
    n = int(.12 * SR); t = np.arange(n) / SR; f = mtof(m) * (1 + 1.5 * np.exp(-t / .01))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .03) * g
def knock():
    n = int(.25 * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 180 * t) + .6 * np.sin(2 * np.pi * 410 * t)) * np.exp(-t / .03) + fft_filter(rs.randn(n), 300, 2500) * np.exp(-t / .01) * .6
    return s * .7
def creak(dur=.7):
    n = int(dur * SR); t = np.arange(n) / SR; f = 210 + 90 * np.sin(2 * np.pi * 1.4 * t)
    saw = ((np.cumsum(f) / SR) % 1) * 2 - 1; g = (np.sin(2 * np.pi * np.cumsum(23 + 8 * t) / SR) > .3).astype(float)
    return fft_filter(saw * g, 400, 3000) * np.sin(np.pi * t / dur) * .2
def shimmer(dur=1.2, base=84, g=.12):
    out = np.zeros(int(dur * SR) + SR)
    for i, m in enumerate([0, 4, 7, 12, 16, 19, 24, 28]):
        s = bell(base + m, .8, g); i0 = int(i * dur / 9 * SR); out[i0:i0 + len(s)] += s
    return out
def thud(g=.8):
    n = int(.4 * SR); t = np.arange(n) / SR; f = 70 + 80 * np.exp(-t / .03)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12) + fft_filter(rs.randn(n), 100, 1200) * np.exp(-t / .03) * .5) * g
def boing(g=.4):
    n = int(.35 * SR); t = np.arange(n) / SR; f = 180 + 260 * (1 - np.exp(-t / .05)) + 30 * np.sin(2 * np.pi * 18 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12) * g
def bikebell():
    n = int(.7 * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(2400, 1, .35), (3150, .6, .2), (5600, .3, .1)])
    return s * .18
def popper():
    n = int(.5 * SR); t = np.arange(n) / SR; s = fft_filter(rs.randn(n), 600, 6000) * np.exp(-t / .03) * .8
    for k in range(18): i = int((.05 + rs.rand() * .4) * SR); s[i:i + 300] += rs.randn(300) * np.exp(-np.arange(300) / 60) * .25
    return s * .6
def click():
    n = int(.06 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .006) + rs.randn(n) * np.exp(-t / .002) * .4) * .5

# S1
add(sfx, 0.0, whoosh(1.1, 300, 1800, .25), 1, -.3, .3)       # dolly through foreground clouds
add(sfx, .48, boing(.25), 1, -.2)                             # jump takeoff
add(sfx, .78, bonk(), 1, -.25, .3); add(sfx, .80, coin(), 1, -.3, .5)
for i in range(12): add(sfx, .78 + .06 + i * .045 + .34, pop(76 + (i % 5) * 3, .12), 1, -.4 + i * .07, .2)  # letters land
add(sfx, 1.96, thud(1.0), 1, .2, .3)                          # SINANG! slam
add(sfx, 3.42, whoosh(.6, 400, 4000, .55), 1, .5, .2)          # whip to staircase
# S2
for j in range(1, 6):
    for k in range(6): add(sfx, 4.08 + .22 * j + .5 * k + .42, pop(60 + k * 2, .05), 1, (j - 3) * .2)
add(sfx, 4.5, shimmer(.6, 88, .06), 1, -.3, .5)               # JONY KIDS letters
add(sfx, 5.45, whoosh(.55, 700, 2600, .3), 1, -.4, .3)         # ribbon unfurls
add(sfx, 7.3, whoosh(.55, 300, 3000, .45), 1, .5, .2)          # pan to door
# S3
for kt in (8.125, 8.375): add(sfx, kt, knock(), 1, -.1, .4)
add(sfx, 8.6, whoosh(.5, 200, 6000, .25), 1, 0, .6)            # reverse-ish swell
add(sfx, 8.75, creak(.75), 1, .25, .3)
add(sfx, 8.85, shimmer(1.0, 79, .1), 1, 0, .7)                 # light spills
for j in range(6): add(sfx, 9.125 + j * .09, pop(72 + j * 2, .16), 1, (j - 2.5) * .25, .3)   # gifts launch
add(sfx, 9.55, popper(), 1, .1, .4)
for j in range(6): add(sfx, 9.75 + j * .09, thud(.22), 1, (j - 2.5) * .25)                   # catches
add(sfx, 11.3, whoosh(.8, 200, 5000, .5), 1, 0, .4)           # dolly into the doorway
add(sfx, 11.7, shimmer(.45, 91, .07), 1, 0, .8)
# S4
add(sfx, 12.5, thud(.8), 1, -.4, .2); add(sfx, 12.62, bikebell(), 1, -.45, .4); add(sfx, 12.92, bikebell(), .8, -.45, .4)
for bt, g in ((13.13, .2), (13.5, .45), (13.68, .3), (13.9, .2), (14.12, .12)): add(sfx, bt, boing(g), 1, .45, .2)
add(sfx, 14.2, shimmer(1.0, 84, .1), 1, 0, .7); add(sfx, 14.35, popper(), .9, 0, .4)
add(sfx, 15.5, whoosh(.55, 3000, 300, .5), 1, 0, .2)           # whip down
# S5
add(sfx, 16.0, whoosh(.45, 4000, 600, .35), 1, 0, .2)
add(sfx, 16.27, thud(.9), 1, 0, .3); add(sfx, 16.4, creak(.9), .8, .3, .3)
add(sfx, 16.72, coin(), 1, .1, .5); add(sfx, 16.9, coin(), .7, -.2, .5)
for k in range(8): add(sfx, 16.9 + k * .19 + rs.rand() * .05, bell(96 + (k % 3) * 2, .25, .05), 1, rs.rand() - .5, .3)  # coin rain tinks
add(sfx, 16.65, popper(), .7, 0, .4)
add(sfx, 17.48, whoosh(.4, 500, 2500, .3), 1, 0, .2)
add(sfx, 18.5, click(), 1, .35); add(sfx, 18.52, pop(91, .2), 1, .35, .5)
add(sfx, 18.85, shimmer(.6, 96, .04), 1, .2, .6)

# ---------------- mix ----------------
def reverb(x, secs=1.6):
    n = int(secs * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for c in range(2):
        ir = rs.randn(n) * np.exp(-t / (secs / 5)); ir = fft_filter(ir, 200, 7000); ir /= np.sqrt((ir ** 2).sum())
        L = len(x) + n; nfft = 1 << (L - 1).bit_length()
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x)]
    return out
wet = reverb(verb_send)
mix = mus * .62 + sfx * .95 + wet * .38
# sidechain-ish ducking of music under big SFX
mix = mix[:int(DUR * SR)]
# fade out tail last 0.35s, short fade-in
n = len(mix); fo = int(.35 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2; mix[:240] *= np.linspace(0, 1, 240)[:, None]
# soft limiter + normalize to -1 dBFS peak
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 10 ** (-1 / 20) / np.abs(mix).max()
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', n / SR, 'peak', np.abs(mix).max(), 'rms dB', 20 * np.log10(np.sqrt((mix ** 2).mean())))
