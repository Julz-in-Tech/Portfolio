import { useState, type PointerEvent } from "react";
import { categories, projects, type Category, type Repo } from "./data";

// Moves the card's glow to follow the pointer.
const trackPointer = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const updated = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { month: "short", year: "numeric" });

export default function Projects({ repos, live }: { repos: Repo[]; live: boolean }) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const shown = projects.filter((p) => filter === "all" || p.categories.includes(filter));

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {categories.map((c) => (
          <button
            key={c.id}
            className={filter === c.id ? "chip active" : "chip"}
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
            <span className="chip-count">
              {c.id === "all"
                ? projects.length
                : projects.filter((p) => p.categories.includes(c.id as Category)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="project-grid">
        {shown.map((p, i) => (
          <article
            key={`${filter}-${p.slug}`}
            className="card project"
            style={{ animationDelay: `${i * 60}ms` }}
            onPointerMove={trackPointer}
          >
            <span className="project-num">{String(i + 1).padStart(2, "0")}</span>
            {p.badge && <span className="award">★ {p.badge}</span>}
            <h3>{p.name}</h3>
            <p className="project-blurb">{p.blurb}</p>
            <p className="project-detail">{p.detail}</p>
            <ul className="tags">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="project-links">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer">
                  Live demo <span aria-hidden>↗</span>
                </a>
              )}
              <a href={p.repo} target="_blank" rel="noreferrer">
                Code <span aria-hidden>↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="repo-head">
        <h3>Recently on GitHub</h3>
        <span className={live ? "live on" : "live"}>{live ? "live from GitHub" : "snapshot"}</span>
      </div>
      <ul className="repo-list">
        {repos.map((r) => (
          <li key={r.name}>
            <a href={r.html_url} target="_blank" rel="noreferrer">
              <span className="repo-name">{r.name.replace(/-+$/, "").replace(/[-_]/g, " ")}</span>
              <span className="repo-desc">{r.description ?? "No description yet."}</span>
              <span className="repo-meta">
                {r.language ?? "docs"} · {updated(r.updated_at)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
