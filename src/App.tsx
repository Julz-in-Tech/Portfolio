import type { PointerEvent } from "react";
import { certifications, profile, skills, timeline } from "./data";
import { useCv, useGitHub, useIntro, useReveal, useScrollProgress } from "./hooks";
import Music from "./Music";
import Pipeline from "./Pipeline";
import Projects from "./Projects";
import Terminal from "./Terminal";

const NAV = ["work", "about", "stack", "terminal", "contact"];
const CMD = "whoami";
const [FIRST, LAST] = profile.name.toUpperCase().split(" ");
const LETTERS = FIRST.length + LAST.length;
const MARQUEE = skills.flatMap((s) => s.items).slice(0, 18);

/** Blinking block cursor that takes up no width, so text never shifts. */
const Caret = () => (
  <span className="caret-anchor" aria-hidden>
    <span className="caret" />
  </span>
);

export default function App() {
  const gh = useGitHub();
  const cv = useCv();
  const progress = useScrollProgress();
  const intro = useIntro(CMD, FIRST + LAST, profile.role);
  const done = intro.phase === "done";
  useReveal();

  // The photo tilts towards the pointer.
  const tilt = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--ry", `${x * 14}deg`);
    e.currentTarget.style.setProperty("--rx", `${-y * 14}deg`);
  };
  const untilt = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--ry", "0deg");
    e.currentTarget.style.setProperty("--rx", "0deg");
  };

  // One word of the name, letter by letter. `offset` is the index of its first letter.
  const word = (text: string, offset: number) => (
    <span className="word" aria-hidden>
      {[...text].map((ch, i) => {
        const index = offset + i;
        return (
          <span key={i}>
            {intro.phase === "name" && intro.name === index && <Caret />}
            <span className={index < intro.name ? "letter on" : "letter"}>{ch}</span>
          </span>
        );
      })}
    </span>
  );

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />

      <header className="nav">
        <a className="logo" href="#top" aria-label="Julia Moyo, back to top">
          JM<span className="c-green">_</span>
        </a>
        <nav aria-label="Sections">
          {NAV.map((id) => (
            <a key={id} href={`#${id}`}>
              {id}
            </a>
          ))}
        </nav>
        <Music />
      </header>

      <main>
        <section id="top" className="hero">
          <div className="blob blob-pink" aria-hidden />
          <div className="blob blob-green" aria-hidden />

          <div className="hero-copy">
            <p className="hero-prompt">
              <span className="c-green">visitor@julias-portfolio</span>:
              <span className="c-pink">~</span>$ {CMD.slice(0, intro.cmd)}
              {intro.phase === "cmd" && <Caret />}
            </p>

            <h1 className="hero-name" aria-label={profile.name}>
              {word(FIRST, 0)}
              {word(LAST, FIRST.length)}
            </h1>

            <p className="hero-role">
              <span className="c-green">&gt;</span> {profile.role.slice(0, intro.role)}
              {(intro.phase === "role" || done) && <Caret />}
            </p>

            <div className={done ? "hero-rest in" : "hero-rest"}>
              <p className="lede">
                I trained as a journalist, then swapped headlines for functions. Now I build full
                stack web apps, security tooling and accessible AI from {profile.location}.
              </p>
              <div className="cta">
                <a className="btn btn-primary" href="#work">
                  See my work ↓
                </a>
                {cv && (
                  <a className="btn" href={profile.cv} download>
                    Download CV ↓
                  </a>
                )}
                <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
                <button className="btn btn-ghost" onClick={intro.replay}>
                  ↻ Replay
                </button>
              </div>
            </div>
          </div>

          <figure
            className={intro.name >= LETTERS ? "photo in" : "photo"}
            onPointerMove={tilt}
            onPointerLeave={untilt}
          >
            <div className="photo-frame">
              <div className="photo-bar">
                <i />
                <i />
                <i />
                <span>julia.jpg</span>
              </div>
              <img src="./julia-selfie.jpg" alt="Portrait of Julia Moyo" />
            </div>
            <figcaption className="sticker sticker-a">
              <span className="pulse" /> open to work
            </figcaption>
            <span className="sticker sticker-b" aria-hidden>
              {"{ journalist → dev }"}
            </span>
          </figure>
        </section>

        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
        </div>

        <section id="work">
          <div className="section-head" data-reveal>
            <p className="eyebrow">01 // work</p>
            <h2>
              Things I have <span className="c-pink">built</span>
            </h2>
            <p>Real problems, shipped end to end. Filter by what you care about.</p>
          </div>
          <Projects repos={gh.repos} live={gh.live} />
        </section>

        <section id="about">
          <div className="section-head" data-reveal>
            <p className="eyebrow">02 // about</p>
            <h2>
              From bylines to <span className="c-green">backends</span>
            </h2>
          </div>
          <div className="about">
            <div className="about-story" data-reveal>
              <p>
                Journalism taught me to ask good questions, find what actually matters and explain
                it clearly. It turns out that is most of software development too.
              </p>
              <p>
                I'm studying software development at <b>WeThinkCode_</b> and building across the
                stack: React on the front, Node.js, Java and Python behind it, SQL underneath. I'm
                drawn to cybersecurity, AI and technology that makes life safer and more accessible.
              </p>
              <figure className="grad">
                <div className="photo-frame">
                  <div className="photo-bar">
                    <i />
                    <i />
                    <i />
                    <span>graduation.jpg</span>
                  </div>
                  <img
                    src="./julia-graduation.jpg"
                    alt="Julia Moyo in her graduation gown, holding a bouquet"
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <span className="c-pink">2023</span> // Diploma in Journalism Studies, where the
                  story started.
                </figcaption>
              </figure>
              <blockquote>"{profile.tagline}"</blockquote>
              <dl className="stats">
                <div>
                  <dt>{gh.stats.repos}</dt>
                  <dd>public repos</dd>
                </div>
                <div>
                  <dt>5</dt>
                  <dd>live deployments</dd>
                </div>
                <div>
                  <dt>3rd</dt>
                  <dd>She Builds Hackathon</dd>
                </div>
                <div>
                  <dt>{gh.stats.followers}</dt>
                  <dd>GitHub followers</dd>
                </div>
              </dl>
            </div>
            <ol className="timeline">
              {timeline.map((t) => (
                <li key={t.title} data-reveal>
                  <span className="when">{t.when}</span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div id="certifications" className="certs-block">
            <h3 className="certs-title" data-reveal>
              <span className="c-green">$</span> ls certifications/
            </h3>
            <ul className="certs">
              {certifications.map((c) => (
                <li key={c.name} className="card cert" data-reveal>
                  <span className="when">{c.when}</span>
                  <h4>{c.name}</h4>
                  <p>{c.issuer}</p>
                  {c.link && (
                    <a href={c.link} target="_blank" rel="noreferrer">
                      {c.linkLabel ?? "Credential"} ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="stack">
          <div className="section-head" data-reveal>
            <p className="eyebrow">03 // stack</p>
            <h2>
              What I work <span className="c-pink">with</span>
            </h2>
          </div>
          <div className="skills">
            {skills.map((s) => (
              <div key={s.group} className="card skill" data-reveal>
                <h3>{s.group}</h3>
                <ul className="tags">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Pipeline />
        </section>

        <section id="terminal">
          <div className="section-head" data-reveal>
            <p className="eyebrow">04 // terminal</p>
            <h2>
              Prefer the <span className="c-green">command line?</span>
            </h2>
            <p>This one is real. Type a command or click any pink one.</p>
          </div>
          <div data-reveal>
            <Terminal gh={gh} cv={cv} />
          </div>
        </section>

        <section id="contact" className="contact" data-reveal>
          <p className="eyebrow">05 // contact</p>
          <h2>
            Let's build <span className="c-pink">something.</span>
          </h2>
          <p>I'm open to junior and graduate full stack roles, internships and collaborations.</p>
          <div className="cta">
            <a className="btn btn-primary" href={profile.linkedin} target="_blank" rel="noreferrer">
              Message me on LinkedIn ↗
            </a>
            {cv && (
              <a className="btn" href={profile.cv} download>
                Download CV ↓
              </a>
            )}
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
              Follow on GitHub ↗
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Julia Moyo</span>
        <span>Built with React and TypeScript in Johannesburg, ZA</span>
      </footer>
    </>
  );
}
