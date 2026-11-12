import { useEffect, useState } from "react";
import { reducedMotion } from "./hooks";

const STEPS = [
  { name: "Code", log: "git push origin main" },
  { name: "Build", log: "compiling… bundle ready" },
  { name: "Test", log: "all tests passed" },
  { name: "Quality", log: "lint clean, no vulnerabilities" },
  { name: "Deploy", log: "live in production" },
];

/** A small playable version of the pipeline I'm learning to automate. */
export default function Pipeline() {
  // -1 idle, 0..4 running that step, 5 finished
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < STEPS.length;
  const done = step === STEPS.length;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), reducedMotion() ? 150 : 850);
    return () => clearTimeout(t);
  }, [step, running]);

  return (
    <div className="card pipeline" data-reveal>
      <div className="pipeline-head">
        <div>
          <h3>How I ship</h3>
          <p>From "it works on my machine" to something reliable. Run it.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setStep(0)} disabled={running}>
          {running ? "Running…" : done ? "Run again" : "▶ Run pipeline"}
        </button>
      </div>
      <ol className="pipeline-steps">
        {STEPS.map((s, i) => {
          const state = step > i ? "done" : step === i ? "active" : "idle";
          return (
            <li key={s.name} className={state}>
              <span className="pipeline-node">{state === "done" ? "✓" : i + 1}</span>
              <span className="pipeline-name">{s.name}</span>
            </li>
          );
        })}
      </ol>
      <p className="pipeline-log" aria-live="polite">
        <span className="c-green">$</span>{" "}
        {step === -1
          ? "waiting for a push…"
          : done
            ? "deployed. Works on more than my machine."
            : STEPS[step].log}
      </p>
    </div>
  );
}
