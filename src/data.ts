// All the content on the site lives here. Edit this file to update the portfolio.

export const GITHUB_USER = "Julz-in-Tech";

export const profile = {
  name: "Julia Moyo",
  role: "Full Stack Software Developer",
  location: "Johannesburg, South Africa",
  tagline: "Coding the life I once journaled about.",
  github: `https://github.com/${GITHUB_USER}`,
  linkedin: "https://www.linkedin.com/in/julia-moyo-57444232b",
  // Put the PDF in public/ with exactly this name. The download buttons appear once it exists.
  cv: "./Julia-Moyo-CV.pdf",
  // Words cycled through in the hero: "I build ___"
  builds: [
    "full stack web apps",
    "security tooling",
    "accessible AI",
    "things that actually ship",
  ],
};

export type Category = "fullstack" | "ai" | "security";

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fullstack", label: "Full stack" },
  { id: "ai", label: "AI" },
  { id: "security", label: "Security" },
];

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  detail: string;
  stack: string[];
  categories: Category[];
  repo?: string;
  repoLabel?: string;
  live?: string;
  badge?: string;
};

const gh = (repo: string) => `https://github.com/${GITHUB_USER}/${repo}`;

export const projects: Project[] = [
  {
    slug: "boikanyo-legacy",
    name: "Boikanyo Legacy",
    blurb: "A mobile-first marketing and ordering site for personalised kids' party packs.",
    detail: "Built for a South African business that makes personalised kids' party packs.",
    stack: ["TypeScript", "HTML", "CSS", "JavaScript"],
    categories: ["fullstack"],
    repo: "https://github.com/Julz-in-Tech/Boikanyo-Legacy-",
    repoLabel: "Private source",
    live: "https://boikanyo-legacy.vercel.app/",
  },
  {
    slug: "commuteit",
    name: "CommuteIt",
    blurb: "Moves parcels between local spaza shops with people already travelling that way.",
    detail:
      "Drop a parcel at a nearby shop, a runner carries it along their usual route, and the recipient collects it from a shop near them.",
    stack: ["TypeScript", "PL/pgSQL", "CSS"],
    categories: ["fullstack"],
    repo: "https://github.com/MonamaTV/commuteit",
    repoLabel: "Private source",
    live: "https://commuteit.vercel.app/",
  },
  {
    slug: "thuso",
    name: "Thuso",
    blurb: "A safety layer between getting a job offer and showing up to the interview.",
    detail:
      "Helps job seekers spot recruitment scams, verify opportunities and prepare safely before travelling to an unfamiliar location. Built with my team, The Smurfs, in a hackathon.",
    stack: ["React", "Vite", "Python", "REST API", "Cisco API"],
    categories: ["fullstack", "security"],
    repo: gh("thuso"),
    live: "https://thuso-theta.vercel.app",
    badge: "3rd place · She Builds Hackathon 2026",
  },
  {
    slug: "phishguard",
    name: "PhishGuard AI",
    blurb: "Flags phishing emails inside Gmail and explains why.",
    detail:
      "A Chrome extension reads the open email, a Java Spring Boot gateway routes it, and a Python FastAPI service scores the risk from text, sentiment and URL features, returning a verdict with the reasons behind it.",
    stack: ["Java", "Spring Boot", "Python", "FastAPI", "Chrome Extension", "Docker"],
    categories: ["ai", "security", "fullstack"],
    repo: gh("PhishGuard-AI"),
  },
  {
    slug: "qualitrack",
    name: "QualiTrack",
    blurb: "Quality control management for manufacturing traceability.",
    detail:
      "Captures incoming goods inspections, stores QC results and automatically raises a non-conformance report when failures are recorded.",
    stack: ["React", "Node.js", "Express", "PostgreSQL", "Firebase", "Tailwind"],
    categories: ["fullstack"],
    repo: gh("QualiTrack2.0"),
    live: "https://quali-track2-0.vercel.app",
  },
  {
    slug: "fitbet",
    name: "FitBet",
    blurb: "Gym accountability where skipping a session costs you.",
    detail:
      "Friends log gym days on a shared calendar and earn a daily reward. At month end, whoever showed up less pays out the winner.",
    stack: ["React", "Vite", "Firebase"],
    categories: ["fullstack"],
    repo: gh("FitBet"),
    live: "https://fit-bet-one.vercel.app",
  },
  {
    slug: "visionguide",
    name: "VisionGuide AI",
    blurb: "Accessibility tool bridging signers and non-signers in real time.",
    detail:
      "Tracks hand landmarks with computer vision and uses a large language model to turn South African Sign Language into text and voice, and speech back into signs.",
    stack: ["MediaPipe", "Gemini", "Computer vision", "Speech"],
    categories: ["ai"],
    repo: gh("unit_lens2"),
    live: "https://visionguide-ai.vercel.app/",
  },
  {
    slug: "cybersec",
    name: "Cybersecurity Labs",
    blurb: "Hands-on exercises across the security fundamentals.",
    detail:
      "Practical labs covering network security, cryptography, vulnerability analysis, access control and secure software development.",
    stack: ["Network security", "Cryptography", "Access control"],
    categories: ["security"],
    repo: gh("CyberSecurity-Exercises"),
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Java", "Python", "JavaScript", "TypeScript", "SQL", "HTML", "CSS"] },
  { group: "Frontend", items: ["React", "Vite", "Tailwind CSS", "Responsive design"] },
  { group: "Backend", items: ["Node.js", "Express", "Spring Boot", "FastAPI", "REST APIs"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "Firebase"] },
  { group: "DevOps & tooling", items: ["Git", "GitHub", "Docker", "CI/CD", "Linux", "Maven"] },
  { group: "Exploring", items: ["Cybersecurity", "AI & GenAI", "Software testing", "Cloud"] },
];

export const timeline: { when: string; title: string; text: string }[] = [
  {
    when: "2026",
    title: "3rd place, She Builds Hackathon",
    text: "Cisco WISE × WeThinkCode_. Built Thuso with my team to protect job seekers from recruitment scams.",
  },
  {
    when: "2026",
    title: "FNB App Academy & Red Hat RH024",
    text: "App development fundamentals, plus Red Hat Enterprise Linux: CLI tools, user administration, systemd and storage.",
  },
  {
    when: "2025 – now",
    title: "WeThinkCode_",
    text: "NQF 6 Software Development. Java, Python, SQL, Docker, testing and CI/CD pipelines.",
  },
  {
    when: "2025 – now",
    title: "SheCodes",
    text: "Responsive websites with HTML, CSS and JavaScript.",
  },
  {
    when: "2021 – 2023",
    title: "IIE Rosebank College",
    text: "Diploma in Journalism Studies. Where I learned to ask good questions and explain things clearly.",
  },
];

export type Certification = {
  name: string;
  issuer: string;
  when: string;
  /** Link to the credential (LinkedIn "Show credential" URL) or to the coursework. */
  link?: string;
  /** Text on the link. Defaults to "Credential". */
  linkLabel?: string;
};

// To add one: copy a block, and paste the "Show credential" URL from LinkedIn into `link`.
export const certifications: Certification[] = [
  {
    name: "SheCodes Basics Certificate",
    issuer: "SheCodes",
    when: "Feb 2026",
  },
  {
    name: "Red Hat Enterprise Linux Technical Overview (RH024)",
    issuer: "Red Hat",
    when: "2026",
    link: gh("Red-Hat-Enterprise-Linux-Technical-Overview-RH024-"),
    linkLabel: "Coursework",
  },
  {
    name: "FNB App Academy",
    issuer: "FNB",
    when: "2026",
    link: gh("FNB-APP-ACADEMY"),
    linkLabel: "Coursework",
  },
];

// Shown if the GitHub API can't be reached (rate limit, offline, etc).
export const fallbackStats = { repos: 16, followers: 33 };

export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  updated_at: string;
  fork: boolean;
};

export const fallbackRepos: Repo[] = [
  {
    name: "PhishGuard-AI",
    description: "Security pipeline that flags phishing attacks and explains why an input was flagged.",
    html_url: gh("PhishGuard-AI"),
    homepage: null,
    language: "JavaScript",
    updated_at: "2026-09-28T18:26:33Z",
    fork: false,
  },
  {
    name: "Red-Hat-Enterprise-Linux-Technical-Overview-RH024-",
    description: "A structured journey through Red Hat Enterprise Linux (RH024).",
    html_url: gh("Red-Hat-Enterprise-Linux-Technical-Overview-RH024-"),
    homepage: null,
    language: null,
    updated_at: "2026-09-24T13:18:45Z",
    fork: false,
  },
  {
    name: "FNB-APP-ACADEMY",
    description: "Activities from the FNB App Academy.",
    html_url: gh("FNB-APP-ACADEMY"),
    homepage: null,
    language: "Python",
    updated_at: "2026-07-21T07:41:29Z",
    fork: false,
  },
  {
    name: "QualiTrack",
    description: "Quality Control Management Web Application",
    html_url: gh("QualiTrack"),
    homepage: "https://quali-track-lemon.vercel.app",
    language: "JavaScript",
    updated_at: "2026-07-02T20:08:49Z",
    fork: false,
  },
  {
    name: "FitBet",
    description: "Fitness accountability web app with a shared gym calendar.",
    html_url: gh("FitBet"),
    homepage: "https://fit-bet-one.vercel.app",
    language: "JavaScript",
    updated_at: "2026-04-08T12:55:55Z",
    fork: false,
  },
  {
    name: "Tic-Tac-Toe-Game",
    description: "Tic-Tac-Toe Game using python",
    html_url: gh("Tic-Tac-Toe-Game"),
    homepage: null,
    language: "Python",
    updated_at: "2026-02-11T15:48:56Z",
    fork: false,
  },
];
