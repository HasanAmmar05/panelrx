/**
 * Demo sound effects using Web Audio API.
 * Generates realistic phone/DTMF tones without any external audio files.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Play a simple tone at given frequency */
function playTone(freq: number, durationMs: number, volume = 0.15, type: OscillatorType = 'sine') {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

/** DTMF tone (two frequencies combined, like pressing a phone key) */
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

export function playDTMF(key: string, durationMs = 150) {
  const pair = DTMF_FREQS[key];
  if (!pair) return;
  playTone(pair[0], durationMs, 0.12);
  playTone(pair[1], durationMs, 0.12);
}

/** Phone dial tone (350 + 440 Hz continuous) */
export function playDialTone(durationMs = 1500) {
  playTone(350, durationMs, 0.08);
  playTone(440, durationMs, 0.08);
}

/** Phone ring tone (440 + 480 Hz, on/off pattern) */
export function playRingTone() {
  const ctx = getCtx();
  // Ring: 2s on, 4s off pattern — we just play one ring burst
  for (let i = 0; i < 2; i++) {
    const offset = i * 0.8;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.frequency.value = 440;
    osc2.frequency.value = 480;
    gain.gain.setValueAtTime(0.08, ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.6);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(ctx.currentTime + offset);
    osc2.start(ctx.currentTime + offset);
    osc1.stop(ctx.currentTime + offset + 0.6);
    osc2.stop(ctx.currentTime + offset + 0.6);
  }
}

/** IVR "please hold" beep */
export function playHoldBeep() {
  playTone(800, 200, 0.06);
  setTimeout(() => playTone(600, 200, 0.06), 250);
}

/** Connection established chime */
export function playConnectChime() {
  playTone(523, 120, 0.1); // C5
  setTimeout(() => playTone(659, 120, 0.1), 130); // E5
  setTimeout(() => playTone(784, 200, 0.1), 260); // G5
}

/** Call ended tone */
export function playHangupTone() {
  playTone(480, 300, 0.08);
  setTimeout(() => playTone(350, 400, 0.06), 350);
}

/** Keyboard typing sound (subtle click) */
export function playKeyClick() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 4000 + Math.random() * 2000;
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.02);
}

/** Success notification sound */
export function playSuccessChime() {
  playTone(659, 150, 0.08); // E5
  setTimeout(() => playTone(784, 150, 0.08), 160); // G5
  setTimeout(() => playTone(1047, 250, 0.1), 320); // C6
}

/** Warning/alert beep */
export function playAlertBeep() {
  playTone(880, 100, 0.1);
  setTimeout(() => playTone(880, 100, 0.1), 200);
}
