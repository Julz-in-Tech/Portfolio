import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { categories, certifications, profile, projects, skills, timeline, type Category } from "./data";
import { reducedMotion, useClock, type GitHubData } from "./hooks";

type Line = { id: number; kind: "in" | "out"; node: ReactNode };

const HELP: [string, string][] = [
  ["about", "who is Julia?"],
  ["projects", "what I have built (try: projects ai)"],
  ["open <name>", "launch a project, e.g. open thuso"],
  ["skills", "my tech stack"],
  ["journey", "education and milestones"],
  ["certs", "certifications and courses"],
  ["repos", "latest activity, live from GitHub"],
  ["pipeline", "watch how I ship"],
  ["contact", "where to find me"],
  ["cv", "download my CV"],
  ["ls / cat <file>", "poke around the file system"],
  ["history", "commands you have run"],
  ["clear", "wipe the screen"],
];

const FILES: Record<string, string> = {
  "about.md": "about",
  "projects/": "projects",
  "skills.json": "skills",
  "journey.log": "journey",
  "certifications/": "certs",
  "contact.txt": "contact",
};

const COMMANDS = [
  "about",
  "cat",
  "certs",
  "clear",
  "contact",
  "cv",
  "help",
  "history",
  "journey",
  "ls",
  "open",
  "pipeline",
  "projects",
  "repos",
  "skills",
  "whoami",
];

const QUICK = ["about", "projects", "skills", "journey", "certs", "repos", "pipeline", "contact", "clear"];

const FILTERS = categories.filter((c) => c.id !== "all").map((c) => c.id as Category);

const PIPELINE = [
  ["code", "git push origin main"],
  ["build", "compiling, bundle ready"],
  ["test", "all tests passed"],
  ["quality", "lint clean, no vulnerabilities"],
  ["deploy", "live in production"],
];

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

/** Prints the pipeline one stage at a time. */
function PipelineRun({ onTick }: { onTick: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    onTick();
    if (step >= PIPELINE.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), reducedMotion() ? 0 : 650);
    return () => clearTimeout(t);
    // onTick is stable enough for this one-shot animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  return (
    <div>
      <p className="c-comment"># from "it works on my machine" to something reliable</p>
      {PIPELINE.slice(0, step + 1).map(([name, log], i) => (
        <p key={name} className="row">
          <span className="c-pink">
            [{i + 1}/{PIPELINE.length}] {name.padEnd(8)}
          </span>
          <span>{log}</span>
          <span className="c-green">{i < step ? "✓" : "…"}</span>
        </p>
      ))}
      {step >= PIPELINE.length && (
        <p className="c-green">Deployed. Works on more than my machine.</p>
      )}
    </div>
  );
}

let nextId = 0;

export default function Terminal({ gh, cv }: { gh: GitHubData; cv: boolean }) {
  const clock = useClock();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const interacted = useRef(false); // stay at the top until the visitor runs something

  const toBottom = () => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // After each command: keep the start of long output in view, otherwise follow the prompt.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || !interacted.current) return;
    const cmds = body.querySelectorAll<HTMLElement>("[data-cmd]");
    const last = cmds[cmds.length - 1];
    if (last && cmds.length > 1 && body.scrollHeight - last.offsetTop > body.clientHeight) {
      body.scrollTop = last.offsetTop - 12;
    } else if (cmds.length > 1) {
      toBottom();
    }
  }, [lines]);

  // Buttons inside old output always call the latest submit.
  const runRef = useRef<(cmd: string) => void>(() => {});
  const Run = ({ cmd, children }: { cmd: string; children?: ReactNode }) => (
    <button className="t-link" onClick={() => runRef.current(cmd)}>
      {children ?? cmd}
    </button>
  );

  const about = () => (
    <>
      <p className="t-name">{profile.name}</p>
      <div className="kv">
        <span>role</span>
        <span>{profile.role}</span>
        <span>location</span>
        <span>{profile.location}</span>
        <span>studying</span>
        <span>Software Development at WeThinkCode_</span>
        <span>stack</span>
        <span>React · Node.js · Java · Python · SQL</span>
        <span>github</span>
        <span>
          {gh.stats.repos} public repos · {gh.stats.followers} followers
        </span>
        <span>status</span>
        <span className="c-green">open to work</span>
      </div>
      <p>
        I trained as a journalist, then swapped headlines for functions. Journalism taught me to
        ask good questions, find what matters and explain it clearly, which turns out to be most
        of software development too.
      </p>
      <p>
        Now I build across the stack, and I'm drawn to cybersecurity, AI and technology that makes
        life safer and more accessible.
      </p>
      <p className="c-comment"># "{profile.tagline}"</p>
    </>
  );

  const help = () => (
    <>
      <div className="kv wide">
        {HELP.map(([cmd, desc]) => (
          <span key={cmd} style={{ display: "contents" }}>
            <span>
              {cmd.includes("<") || cmd.includes("/") ? (
                <b className="c-pink">{cmd}</b>
              ) : (
                <Run cmd={cmd} />
              )}
            </span>
            <span>{desc}</span>
          </span>
        ))}
      </div>
      <p className="c-comment"># tip: ↑ ↓ for history, Tab to autocomplete, or click any pink command</p>
    </>
  );

  const listProjects = (arg: string) => {
    const filter = FILTERS.find((f) => f === arg.replace(/[-\s]/g, ""));
    if (arg && !filter)
      return (
        <p>
          Unknown filter "{arg}". Try: {FILTERS.join(", ")}
        </p>
      );
    const shown = projects.filter((p) => !filter || p.categories.includes(filter));
    return (
      <>
        <p className="c-comment">
          # {shown.length} project{shown.length === 1 ? "" : "s"}
          {filter ? ` tagged ${filter}` : ""}
        </p>
        {shown.map((p) => (
          <div key={p.slug} className="t-block">
            <p>
              <b className="c-green">{p.name}</b>
              {p.badge && <span className="t-badge">★ {p.badge}</span>}
            </p>
            <p>{p.blurb}</p>
            <p className="c-dim">{p.detail}</p>
            <p className="c-dim">[{p.stack.join(" · ")}]</p>
            <p className="links">
              {p.live && <Ext href={p.live}>live demo ↗</Ext>}
              <Ext href={p.repo}>source ↗</Ext>
            </p>
          </div>
        ))}
        <p>
          filter:{" "}
          {FILTERS.map((f) => (
            <span key={f}>
              <Run cmd={`projects ${f}`} />{" "}
            </span>
          ))}
          <Run cmd="projects" />
        </p>
      </>
    );
  };

  const evaluate = (raw: string): ReactNode | "clear" => {
    const [first, ...rest] = raw.trim().split(/\s+/);
    const cmd = first.toLowerCase();
    const arg = rest.join(" ").toLowerCase();

    switch (cmd) {
      case "help":
        return help();
      case "about":
      case "whoami":
      case "neofetch":
        return about();
      case "projects":
      case "work":
        return listProjects(arg);
      case "open": {
        const p = arg
          ? projects.find(
              (x) => x.slug === arg || x.name.toLowerCase() === arg || x.slug.startsWith(arg),
            )
          : undefined;
        if (!p)
          return (
            <p>
              No project called "{arg || "…"}". Try:{" "}
              {projects.map((x) => (
                <span key={x.slug}>
                  <Run cmd={`open ${x.slug}`}>{x.slug}</Run>{" "}
                </span>
              ))}
            </p>
          );
        const url = p.live ?? p.repo;
        window.open(url, "_blank", "noopener");
        return (
          <p>
            Opening <b className="c-green">{p.name}</b> →{" "}
            <Ext href={url}>{url.replace("https://", "")}</Ext>
          </p>
        );
      }
      case "skills":
      case "stack":
        return (
          <div className="kv wide">
            {skills.map((s) => (
              <span key={s.group} style={{ display: "contents" }}>
                <span>{s.group.toLowerCase()}</span>
                <span>{s.items.join(" · ")}</span>
              </span>
            ))}
          </div>
        );
      case "journey":
      case "education":
        return (
          <>
            <p className="c-comment"># git log --oneline journey</p>
            {timeline.map((t) => (
              <div key={t.title} className="t-block">
                <p>
                  <span className="c-pink">{t.when}</span> <b className="c-green">{t.title}</b>
                </p>
                <p className="c-dim">{t.text}</p>
              </div>
            ))}
          </>
        );
      case "certs":
      case "certifications":
        return (
          <>
            <p className="c-comment"># ls certifications/</p>
            {certifications.map((c) => (
              <div key={c.name} className="t-block">
                <p>
                  <span className="c-pink">{c.when}</span> <b className="c-green">{c.name}</b>
                </p>
                <p className="c-dim">
                  {c.issuer}
                  {c.link && (
                    <>
                      {" · "}
                      <a href={c.link} target="_blank" rel="noreferrer">
                        {(c.linkLabel ?? "Credential").toLowerCase()} ↗
                      </a>
                    </>
                  )}
                </p>
              </div>
            ))}
          </>
        );
      case "repos":
      case "github":
        return (
          <>
            <p className="c-comment">
              # {gh.live ? "live from api.github.com" : "snapshot (GitHub API unavailable)"}
            </p>
            {gh.repos.map((r) => (
              <p key={r.name} className="row">
                <Ext href={r.html_url}>{r.name}</Ext>
                <span className="c-dim">
                  {r.language ?? "docs"} ·{" "}
                  {new Date(r.updated_at).toLocaleDateString("en-ZA", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
            ))}
            <p>
              all repos → <Ext href={`${profile.github}?tab=repositories`}>github.com/Julz-in-Tech</Ext>
            </p>
          </>
        );
      case "pipeline":
      case "deploy":
        return <PipelineRun onTick={toBottom} />;
      case "contact":
      case "hire":
        return (
          <>
            <p>Open to junior and graduate full stack roles, internships and collaborations.</p>
            <div className="kv">
              <span>linkedin</span>
              <span>
                <Ext href={profile.linkedin}>linkedin.com/in/julia-moyo-57444232b ↗</Ext>
              </span>
              <span>github</span>
              <span>
                <Ext href={profile.github}>github.com/Julz-in-Tech ↗</Ext>
              </span>
            </div>
          </>
        );
      case "cv":
      case "resume": {
        if (!cv) {
          return (
            <p>
              CV not uploaded yet. Meanwhile, try <Run cmd="contact" />.
            </p>
          );
        }
        const a = document.createElement("a");
        a.href = profile.cv;
        a.download = "";
        a.click();
        return (
          <p>
            Downloading <b className="c-green">Julia-Moyo-CV.pdf</b>. Didn't start?{" "}
            <a href={profile.cv} download>
              Get it here ↓
            </a>
          </p>
        );
      }
      case "ls":
        return (
          <p className="ls">
            {Object.entries(FILES).map(([file, c]) => (
              <Run key={file} cmd={c}>
                {file}
              </Run>
            ))}
          </p>
        );
      case "cat":
      case "cd": {
        const target = FILES[arg] ?? FILES[`${arg}/`];
        if (!target) return <p>{cmd}: {arg || "…"}: no such file. Try ls.</p>;
        return evaluate(target);
      }
      case "history":
        return history.length ? (
          <>
            {[...history].reverse().map((h, i) => (
              <p key={i}>
                <span className="c-dim">{String(i + 1).padStart(3)}</span> {h}
              </p>
            ))}
          </>
        ) : (
          <p>Nothing yet.</p>
        );
      case "sudo":
        return arg.startsWith("hire") ? (
          <>
            <p className="c-green">Permission granted. Excellent decision.</p>
            {evaluate("contact")}
          </>
        ) : (
          <p>Nice try. The only sudo command here is: sudo hire julia</p>
        );
      case "clear":
      case "cls":
        return "clear";
      default:
        return (
          <p>
            command not found: {first}. Type <Run cmd="help" />.
          </p>
        );
    }
  };

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    interacted.current = true;
    setCursor(-1);
    setValue("");
    const result = evaluate(text);
    setHistory((h) => [text, ...h]);
    if (result === "clear") {
      setLines([]);
      return;
    }
    setLines((l) => [
      ...l,
      { id: nextId++, kind: "in", node: text },
      { id: nextId++, kind: "out", node: result },
    ]);
  };
  runRef.current = submit;

  // Boot: greet with `about`, then show the available commands.
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    setLines([
      { id: nextId++, kind: "in", node: "help" },
      { id: nextId++, kind: "out", node: help() },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(cursor - 1, -1);
      setCursor(next);
      setValue(next >= 0 ? history[next] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "Tab" && value) {
      const v = value.toLowerCase();
      const pool = v.startsWith("open ")
        ? projects.map((p) => `open ${p.slug}`)
        : v.startsWith("projects ")
          ? FILTERS.map((f) => `projects ${f}`)
          : v.startsWith("cat ")
            ? Object.keys(FILES).map((f) => `cat ${f}`)
            : COMMANDS;
      const match = pool.find((c) => c.startsWith(v));
      if (match) {
        e.preventDefault();
        setValue(match);
      }
    }
  };

  const prompt = (
    <span className="prompt">
      <span className="c-green">julia@portfolio</span>:<span className="c-pink">~</span>$
    </span>
  );

  return (
    <div className="window">
      <header className="titlebar">
        <span className="dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="title">julia-moyo — portfolio</span>
      </header>

      <div className="tabs" aria-hidden>
        <span>PROBLEMS</span>
        <span>OUTPUT</span>
        <span className="active">TERMINAL</span>
        <span className="shell">bash</span>
      </div>

      <div
        className="body"
        ref={bodyRef}
        onClick={() => {
          // Click anywhere to type, unless the visitor is selecting text.
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
      >
        <div aria-live="polite">
          {lines.map((l) =>
            l.kind === "in" ? (
              <p key={l.id} className="t-in" data-cmd>
                {prompt} {l.node}
              </p>
            ) : (
              <div key={l.id} className="t-out">
                {l.node}
              </div>
            ),
          )}
        </div>
        <label className="t-in t-input">
          {prompt}
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal command"
            placeholder="type a command"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
      </div>

      <nav className="quick" aria-label="Quick commands">
        {QUICK.map((c) => (
          <button key={c} onClick={() => submit(c)}>
            {c}
          </button>
        ))}
      </nav>

      <div className="statusbar">
        <span>⎇ main</span>
        <span className="hide-sm">✓ open to work</span>
        <span className="spacer" />
        <span className="hide-sm">UTF-8</span>
        <span>Johannesburg {clock}</span>
        <span className="hide-sm">© {new Date().getFullYear()} Julia Moyo</span>
      </div>
    </div>
  );
}
