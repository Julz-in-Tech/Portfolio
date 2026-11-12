import { useEffect, useState } from "react";
import { GITHUB_USER, fallbackRepos, fallbackStats, profile, type Repo } from "./data";

/** True once `url` is confirmed to exist in public/ with the expected content type. */
function useFile(url: string, type: string) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(url, { method: "HEAD" })
      .then((r) => {
        // Dev servers answer missing files with the HTML page, so check the type too.
        const match = (r.headers.get("content-type") ?? "").includes(type);
        if (alive) setAvailable(r.ok && match);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url, type]);
  return available;
}

/** Is the CV there? Keeps us from showing a dead download button. */
export const useCv = () => useFile(profile.cv, "pdf");

/** Is there a background track? If not, the music button plays the built-in loop. */
export const useTrack = () => useFile(profile.music, "audio");

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type IntroPhase = "cmd" | "name" | "role" | "done";

/**
 * Drives the opening sequence: a command is "typed", then the name, then the role.
 * Returns how many characters of each are visible so far.
 */
export function useIntro(cmd: string, name: string, role: string) {
  const [state, setState] = useState({ cmd: 0, name: 0, role: 0, phase: "cmd" as IntroPhase });
  const [run, setRun] = useState(0);

  useEffect(() => {
    const finished = { cmd: cmd.length, name: name.length, role: role.length, phase: "done" as const };
    // Runs even when the device asks for reduced motion (battery saver often turns that on):
    // text appearing key by key is not movement, and it is the point of the hero.
    let cancelled = false;
    let timer = 0;
    const wait = (ms: number) => new Promise<void>((r) => (timer = window.setTimeout(r, ms)));
    // Uneven gaps between keys make it read as a person typing.
    const human = (base: number) => base + Math.random() * base;

    (async () => {
      setState({ cmd: 0, name: 0, role: 0, phase: "cmd" });
      await wait(700);
      for (let i = 1; i <= cmd.length && !cancelled; i++) {
        setState((s) => ({ ...s, cmd: i }));
        await wait(human(80));
      }
      await wait(450);
      if (cancelled) return;
      setState((s) => ({ ...s, phase: "name" }));
      for (let i = 1; i <= name.length && !cancelled; i++) {
        setState((s) => ({ ...s, name: i }));
        await wait(human(95));
      }
      await wait(350);
      if (cancelled) return;
      setState((s) => ({ ...s, phase: "role" }));
      for (let i = 1; i <= role.length && !cancelled; i++) {
        setState((s) => ({ ...s, role: i }));
        await wait(human(22));
      }
      await wait(250);
      if (!cancelled) setState(finished);
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cmd, name, role, run]);

  return { ...state, replay: () => setRun((r) => r + 1) };
}

/** Fades in every [data-reveal] element as it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Page scroll progress, 0 to 1. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

/** Current time in Johannesburg, for the terminal status bar. */
export function useClock(): string {
  const format = () =>
    new Date().toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Johannesburg",
    });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const t = window.setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export type GitHubData = { repos: Repo[]; stats: typeof fallbackStats; live: boolean };

/** Live GitHub data, cached for the session, with baked-in fallback content. */
export function useGitHub(): GitHubData {
  const [data, setData] = useState<GitHubData>({
    repos: fallbackRepos,
    stats: fallbackStats,
    live: false,
  });
  useEffect(() => {
    const KEY = "gh-cache-v1";
    try {
      const cached = sessionStorage.getItem(KEY);
      if (cached) {
        setData(JSON.parse(cached));
        return;
      }
    } catch {
      /* ignore */
    }
    const ctrl = new AbortController();
    const api = `https://api.github.com/users/${GITHUB_USER}`;
    Promise.all([
      fetch(api, { signal: ctrl.signal }),
      fetch(`${api}/repos?per_page=100&sort=updated`, { signal: ctrl.signal }),
    ])
      .then(async ([u, r]) => {
        if (!u.ok || !r.ok) throw new Error("GitHub API unavailable");
        const user = await u.json();
        const repos: Repo[] = await r.json();
        const next: GitHubData = {
          stats: { repos: user.public_repos, followers: user.followers },
          repos: repos.filter((x) => !x.fork && x.name !== GITHUB_USER).slice(0, 6),
          live: true,
        };
        setData(next);
        try {
          sessionStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* keep the fallback */
      });
    return () => ctrl.abort();
  }, []);
  return data;
}
