import { useEffect, useRef, useState } from "react";
import { profile } from "./data";
import { useTrack } from "./hooks";

// Background music. Plays the track at `profile.music` if that file exists; otherwise a soft
// lo-fi loop synthesised in the browser with the Web Audio API (no file needed).

const BAR = 4; // seconds per chord
const STEPS = [0, 1, 2, 3, 2, 1, 2, 3]; // arpeggio pattern through the chord
const CHORDS = [
  [110.0, 130.81, 164.81, 196.0], // Am7
  [87.31, 110.0, 130.81, 164.81], // Fmaj7
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [98.0, 123.47, 146.83, 164.81], // G6
];

type Engine = { ctx: AudioContext; master: GainNode; timer: number };

function start(): Engine {
  const ctx = new AudioContext();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
  master.connect(ctx.destination);

  // Everything runs through a low-pass filter to keep it warm, plus a quiet echo.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1500;
  filter.connect(master);

  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.375;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  filter.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  feedback.connect(master);

  const note = (freq: number, type: OscillatorType, at: number, shape: (g: AudioParam) => number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    const end = shape(gain.gain);
    osc.connect(gain).connect(filter);
    osc.start(at);
    osc.stop(end);
  };

  const scheduleBar = (bar: number, at: number) => {
    const chord = CHORDS[bar % CHORDS.length];

    // Pad: the whole chord swelling in and out.
    for (const freq of chord) {
      note(freq, "triangle", at, (g) => {
        g.linearRampToValueAtTime(0.11, at + 1);
        g.setValueAtTime(0.11, at + BAR - 0.4);
        g.linearRampToValueAtTime(0.0001, at + BAR + 0.8);
        return at + BAR + 0.9;
      });
    }

    // Arpeggio: soft plucks two octaves up.
    const step = BAR / STEPS.length;
    STEPS.forEach((s, i) => {
      const t = at + i * step;
      note(chord[s] * 4, "sine", t, (g) => {
        g.linearRampToValueAtTime(0.09, t + 0.02);
        g.exponentialRampToValueAtTime(0.0001, t + 0.9);
        return t + 1;
      });
    });
  };

  // Schedule a little ahead of the clock so timing stays tight.
  let bar = 0;
  let next = ctx.currentTime + 0.1;
  const tick = () => {
    while (next < ctx.currentTime + 1) {
      scheduleBar(bar++, next);
      next += BAR;
    }
  };
  tick();
  const timer = window.setInterval(tick, 250);

  return { ctx, master, timer };
}

function stop({ ctx, master, timer }: Engine) {
  window.clearInterval(timer);
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.4);
  window.setTimeout(() => void ctx.close(), 500);
}

export default function Music() {
  const [on, setOn] = useState(false);
  const engine = useRef<Engine | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const hasTrack = useTrack();

  const silence = () => {
    audio.current?.pause();
    if (engine.current) stop(engine.current);
    engine.current = null;
  };

  const loop = () => {
    engine.current = start();
    setOn(true);
  };

  const toggle = () => {
    if (on) {
      silence();
      setOn(false);
    } else if (hasTrack) {
      if (!audio.current) {
        audio.current = new Audio(profile.music);
        audio.current.loop = true;
        audio.current.volume = 0.35;
      }
      // If the file will not play for any reason, fall back to the built-in loop.
      audio.current.play().then(() => setOn(true), loop);
    } else {
      loop();
    }
  };

  useEffect(() => silence, []);

  if (typeof AudioContext === "undefined") return null;

  return (
    <button
      type="button"
      className={on ? "music on" : "music"}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Turn music on"}
      title={on ? "Turn music off" : "Play some music while you browse"}
    >
      <span className="eq" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="music-label">{on ? "on" : "music"}</span>
    </button>
  );
}
