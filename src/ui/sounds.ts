// src/ui/sounds.ts

/**
 * Sound engine for Everrealm.
 *
 * Uses the Web Audio API to generate simple oscillator-based tones.
 * No audio files, no spatial audio, no looping ambience.
 * Each game event maps to a distinct, short tone or chord.
 *
 * Sound is off by default. Players enable it in Settings.
 * The setting is stored in localStorage as "everrealm:soundEnabled".
 */

const SOUND_KEY = "everrealm:soundEnabled";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new AudioContext();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Returns true if sound is enabled in settings. */
export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === "true";
  } catch {
    return false;
  }
}

/** Sets the sound-enabled flag in localStorage. */
export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
}

/**
 * Plays a single tone at the given frequency.
 * Uses a sine wave (softest) with a gentle attack-decay envelope.
 */
function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  startOffset: number = 0,
  gain: number = 0.15,
): void {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  const now = ctx.currentTime + startOffset;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(gain, now + 0.02);
  env.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

/**
 * Plays a chord (multiple frequencies simultaneously).
 */
function playChord(
  ctx: AudioContext,
  freqs: number[],
  duration: number,
  gain: number = 0.1,
): void {
  for (const f of freqs) {
    playTone(ctx, f, duration, 0, gain);
  }
}

/**
 * Plays an ascending sequence of notes.
 */
function playAscending(
  ctx: AudioContext,
  freqs: number[],
  noteDuration: number,
  gain: number = 0.15,
): void {
  freqs.forEach((f, i) => {
    playTone(ctx, f, noteDuration, i * noteDuration * 0.7, gain);
  });
}

/**
 * The set of game events that have associated sounds.
 * CacaoEarned is deliberately excluded — it fires on every action
 * and would be too frequent/noisy.
 */
export type SoundEvent =
  | "SettlementEstablished"
  | "SettlementsUpgraded"
  | "ResearchCompleted"
  | "SettlementSpecialized"
  | "LandPurchased"
  | "AgeAdvanced"
  | "Ascended"
  | "SpecializationUnlocked";

/**
 * Plays the sound for a given game event.
 * Does nothing if sound is disabled or AudioContext is unavailable.
 */
export function playSound(event: SoundEvent): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  switch (event) {
    case "SettlementEstablished":
      // Single warm mid-range tone — placing a piece
      playTone(ctx, 440, 0.15);
      break;

    case "SettlementsUpgraded":
      // Ascending two-note chime — growth
      playAscending(ctx, [523.25, 659.25], 0.12);
      break;

    case "ResearchCompleted":
      // Soft C-major chord — achievement
      playChord(ctx, [523.25, 659.25, 783.99], 0.3, 0.08);
      break;

    case "SettlementSpecialized":
      // Distinct single tone — specialization
      playTone(ctx, 587.33, 0.15);
      break;

    case "LandPurchased":
      // Low brief tone — expansion
      playTone(ctx, 329.63, 0.1, 0, 0.12);
      break;

    case "AgeAdvanced":
      // Ascending three-note fanfare — major milestone
      playAscending(ctx, [392.0, 523.25, 659.25], 0.15);
      break;

    case "Ascended":
      // Rich sustained chord — the biggest moment
      playChord(ctx, [523.25, 659.25, 783.99, 1046.5], 0.6, 0.07);
      break;

    case "SpecializationUnlocked":
      // Bright ascending two-note — discovery
      playAscending(ctx, [698.46, 880.0], 0.12);
      break;
  }
}