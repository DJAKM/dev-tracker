"use client";
import { CURRICULUM, MONTH_NAMES } from "@/lib/curriculum";
import { ProgressData } from "@/lib/storage";

interface Props {
  progress: ProgressData;
  today: string;
  dayNumber: number;
}

const MONTH_THEMES = [
  {
    goal: "Rebuild Coding Habits",
    emoji: "🧱",
    color: "#6366f1",
    description: "Daily DSA practice, building UI components from scratch, and reading real open-source codebases to understand professional code.",
    outcomes: ["Solve 30+ LeetCode problems", "Build 15+ UI components", "Read 5+ real codebases", "Establish daily coding habit"],
    weeks: ["Arrays & Strings + Flexbox", "LinkedLists & Stacks + CSS Grid", "Trees & Recursion + Open Source", "Sorting & Graphs + Component Patterns"],
  },
  {
    goal: "State Management + Testing",
    emoji: "⚡",
    color: "#a855f7",
    description: "Master Redux Toolkit, Zustand, TanStack Query. Learn to write confident tests with Jest and React Testing Library.",
    outcomes: ["Build apps with Redux + RTK Query", "Proficient in Zustand + React Query", "Write unit + integration tests", "Set up CI/CD pipeline"],
    weeks: ["Redux Toolkit + createAsyncThunk", "Zustand + TanStack Query", "Jest fundamentals + mocking", "RTL + async + custom hooks"],
  },
  {
    goal: "Portfolio Projects",
    emoji: "🚀",
    color: "#22c55e",
    description: "Ship two full-stack, production-ready projects with auth, database, file uploads, and deployment. Quality over quantity.",
    outcomes: ["Project 1: Live with auth + DB", "Project 2: More complex features", "Both deployed & documented", "Case studies written"],
    weeks: ["P1: Setup + Auth + Core", "P1: Features + Deploy + Polish", "P2: Complex domain + real-time", "P2: Deploy + docs + blog post"],
  },
  {
    goal: "Interview Prep + Applying",
    emoji: "🎯",
    color: "#f59e0b",
    description: "System design, behavioral prep, mock interviews, and actively applying to roles. Negotiate well and land a job you love.",
    outcomes: ["System design fluency", "Apply to 30+ companies", "3+ mock interviews done", "Offer negotiated"],
    weeks: ["System Design: 7 patterns", "Resume + LinkedIn + Behavioral", "Active applying + LC review", "Mock interviews + negotiation"],
  },
];

function isoDateFor(startDate: string, dayOffset: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

export default function RoadmapTab({ progress, today, dayNumber }: Props) {
  const months = [1, 2, 3, 4];
  const monthRanges = [{ s: 1, e: 30 }, { s: 31, e: 60 }, { s: 61, e: 90 }, { s: 91, e: 120 }];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem", fontWeight: 700 }}>4-Month Career Roadmap</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>
          From rebuilding habits to landing a job you love. 120 days, one day at a time.
        </p>
      </div>

      {/* Overall progress */}
      {progress.startDate && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Overall Progress</span>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>Day {Math.min(dayNumber, 120)} of 120</span>
          </div>
          <div className="progress-bar" style={{ height: 10, marginBottom: "0.5rem" }}>
            <div className="progress-fill" style={{ width: `${Math.min((dayNumber / 120) * 100, 100)}%`, height: "100%" }} />
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
            {Math.round(Math.min((dayNumber / 120) * 100, 100))}% through the program · {Math.max(120 - dayNumber, 0)} days remaining
          </div>
        </div>
      )}

      {/* Month cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {months.map((m, i) => {
          const theme = MONTH_THEMES[i];
          const range = monthRanges[i];
          const isActive = dayNumber >= range.s && dayNumber <= range.e;
          const isDone = dayNumber > range.e;
          const isLocked = dayNumber < range.s;

          const monthDays = CURRICULUM.filter(d => d.month === m);
          const completedDays = progress.startDate ? monthDays.filter(plan => {
            const date = isoDateFor(progress.startDate!, plan.day - 1);
            if (date > today) return false;
            return (progress.completions[date] || []).length >= Math.ceil(plan.tasks.length * 0.5);
          }).length : 0;
          const pct = Math.round((completedDays / 30) * 100);

          return (
            <div key={m} className="card" style={{ borderColor: isActive ? theme.color : "var(--border)", opacity: isLocked ? 0.5 : 1, transition: "all 0.2s" }}>
              {/* Month header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                  {theme.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>Month {m}</span>
                    {isActive && <span style={{ fontSize: "0.65rem", background: theme.color, color: "white", padding: "1px 8px", borderRadius: 99, fontWeight: 700 }}>ACTIVE</span>}
                    {isDone && <span style={{ fontSize: "0.65rem", background: "var(--green)", color: "#052e16", padding: "1px 8px", borderRadius: 99, fontWeight: 700 }}>COMPLETE</span>}
                    {isLocked && <span style={{ fontSize: "0.65rem", background: "var(--border)", color: "var(--muted)", padding: "1px 8px", borderRadius: 99, fontWeight: 700 }}>UPCOMING</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: theme.color, marginBottom: "0.25rem" }}>{theme.goal}</div>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>{theme.description}</p>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>Days {range.s}–{range.e}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{completedDays}/30 days · {pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: isDone ? "var(--green)" : theme.color }} />
                </div>
              </div>

              {/* Weeks */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "1rem" }}>
                {theme.weeks.map((wk, wi) => {
                  const weekStart = range.s + wi * 7;
                  const weekEnd = Math.min(weekStart + 6, range.e);
                  const wDone = dayNumber > weekEnd;
                  const wActive = dayNumber >= weekStart && dayNumber <= weekEnd;
                  return (
                    <div key={wi} style={{ padding: "0.5rem 0.75rem", background: "var(--surface2)", borderRadius: 8, border: `1px solid ${wActive ? theme.color + "88" : "transparent"}` }}>
                      <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: "2px" }}>Week {wi + 1} · Days {weekStart}–{weekEnd}</div>
                      <div style={{ fontSize: "0.75rem", color: wDone ? "var(--green)" : wActive ? "var(--text)" : "var(--muted)", fontWeight: wActive ? 600 : 400 }}>
                        {wDone ? "✓ " : wActive ? "→ " : ""}{wk}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Outcomes */}
              <div>
                <div style={{ color: "var(--muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Month Outcomes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {theme.outcomes.map(o => (
                    <div key={o} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: isDone ? "var(--green)" : theme.color, fontSize: "0.8rem" }}>{isDone ? "✓" : "◦"}</span>
                      <span style={{ fontSize: "0.8rem", color: isDone ? "var(--muted)" : "var(--text)" }}>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resources section */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Key Resources for Each Month</div>
        {[
          { month: 1, resources: [["NeetCode 150", "https://neetcode.io/roadmap"], ["CSS Tricks Flexbox", "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"], ["javascript.info", "https://javascript.info"], ["Fireship YouTube", "https://youtube.com/@Fireship"]] },
          { month: 2, resources: [["Redux Toolkit Docs", "https://redux-toolkit.js.org/"], ["TanStack Query", "https://tanstack.com/query/latest"], ["Testing Library", "https://testing-library.com/"], ["Kent C. Dodds Blog", "https://kentcdodds.com/blog"]] },
          { month: 3, resources: [["Neon (free PG)", "https://neon.tech"], ["Vercel Deploy", "https://vercel.com"], ["Prisma Docs", "https://www.prisma.io/docs"], ["shadcn/ui", "https://ui.shadcn.com"]] },
          { month: 4, resources: [["System Design Primer", "https://github.com/donnemartin/system-design-primer"], ["levels.fyi", "https://levels.fyi"], ["Blind 75", "https://neetcode.io/roadmap"], ["Interviewing.io", "https://interviewing.io"]] },
        ].map(({ month, resources }) => (
          <div key={month} style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600, marginBottom: "0.35rem" }}>Month {month}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {resources.map(([label, url]) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.75rem", color: "var(--accent)", padding: "2px 10px", border: "1px solid var(--accent)33", borderRadius: 6, textDecoration: "none", background: "var(--surface2)" }}>
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
