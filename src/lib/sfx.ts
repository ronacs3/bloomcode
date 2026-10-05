import { Howler } from 'howler';

export type Sfx =
  | 'till'
  | 'plant'
  | 'water'
  | 'harvest'
  | 'coin'
  | 'click'
  | 'error'
  | 'breed'
  | 'discover'
  | 'mutation'
  | 'sleep'
  | 'unlock';

let ambienceOsc: OscillatorNode | null = null;
let ambienceGain: GainNode | null = null;

let isMutedState = false;

export function setMute(muted: boolean) {
  isMutedState = muted;
  Howler.mute(muted);
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  return (Howler.ctx as AudioContext) || null;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slideTo?: number) {
  const c = getAudioContext();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();

  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(start: number, dur: number, vol = 0.08, filterFreq = 1200) {
  const c = getAudioContext();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();

  const t = c.currentTime + start;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
}

export function playSfx(name: Sfx) {
  if (isMutedState) return;
  switch (name) {
    case 'till':
      noise(0, 0.12, 0.12, 700);
      tone(110, 0, 0.1, 'triangle', 0.08, 70);
      break;
    case 'plant':
      tone(520, 0, 0.08, 'sine', 0.1, 660);
      tone(780, 0.06, 0.1, 'sine', 0.08);
      break;
    case 'water':
      tone(900, 0, 0.12, 'sine', 0.07, 400);
      tone(1200, 0.05, 0.1, 'sine', 0.05, 600);
      break;
    case 'harvest':
      tone(660, 0, 0.08, 'triangle', 0.1);
      tone(880, 0.07, 0.08, 'triangle', 0.1);
      tone(1320, 0.14, 0.14, 'triangle', 0.08);
      break;
    case 'coin':
      tone(988, 0, 0.07, 'square', 0.05);
      tone(1319, 0.07, 0.18, 'square', 0.05);
      break;
    case 'click':
      tone(600, 0, 0.04, 'triangle', 0.06);
      break;
    case 'error':
      tone(220, 0, 0.12, 'square', 0.05, 160);
      break;
    case 'breed':
      tone(300, 0, 1.6, 'sine', 0.05, 900);
      tone(450, 0.2, 1.4, 'triangle', 0.03, 1200);
      break;
    case 'unlock':
      tone(523, 0, 0.1, 'triangle', 0.08);
      tone(784, 0.08, 0.16, 'triangle', 0.08);
      break;
    case 'sleep':
      tone(392, 0, 0.3, 'sine', 0.06);
      tone(330, 0.2, 0.3, 'sine', 0.06);
      tone(262, 0.4, 0.5, 'sine', 0.06);
      break;
    case 'mutation':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.06, 0.2, 'triangle', 0.07));
      break;
    case 'discover':
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.35, 'triangle', 0.08));
      tone(1568, 0.5, 0.6, 'sine', 0.05);
      break;
  }
}

/** Soft ambient lo-fi drone using Howler's WebAudio context */
export function startAmbience() {
  const c = getAudioContext();
  if (!c || ambienceOsc) return;
  if (c.state === 'suspended') void c.resume();

  ambienceOsc = c.createOscillator();
  ambienceGain = c.createGain();

  ambienceOsc.type = 'sine';
  ambienceOsc.frequency.setValueAtTime(146.83, c.currentTime); // D3 note

  ambienceGain.gain.setValueAtTime(0.001, c.currentTime);
  ambienceGain.gain.exponentialRampToValueAtTime(0.015, c.currentTime + 3);

  ambienceOsc.connect(ambienceGain).connect(c.destination);
  ambienceOsc.start();
}
