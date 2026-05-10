"use client";
import { useState, useEffect, useRef } from "react";
import { Question, getDailyQuestions } from "@/lib/questions";
import { Submission } from "@/lib/storage";

interface Props {
  today: string;
}

const DIFF_COLOR = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
const TOPIC_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6", React: "#61dafb",
  "Next.js": "#ffffff", CSS: "#264de4", "System Design": "#a855f7",
  Algorithms: "#22c55e", "Data Structures": "#22c55e", Testing: "#f59e0b",
  Career: "#f97316", Performance: "#06b6d4", Security: "#ef4444", Git: "#f97316",
};
const RATING_CONFIG = {
  wrong:   { label: "Didn't get it", color: "#ef4444", bg: "#3b1a1a", icon: "✗" },
  partial: { label: "Partially right", color: "#f59e0b", bg: "#3b2a14", icon: "◑" },
  correct: { label: "Got it!", color: "#22c55e", bg: "#1c3a2a", icon: "✓" },
} as const;

type SelfRating = "wrong" | "partial" | "correct";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function QuestionsTab({ today }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [filterTopic, setFilterTopic] = useState("All");

  // Per-card state
  const [userCode, setUserCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [selfRating, setSelfRating] = useState<SelfRating | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Submissions from server, keyed by questionId
  const [allSubmissions, setAllSubmissions] = useState<Record<string, Submission[]>>({});
  const [saving, setSaving] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const codeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setQuestions(getDailyQuestions(today, 15));
    setCurrentIdx(0);
    resetCardState();
  }, [today]);

  // Fetch existing submissions on load
  useEffect(() => {
    fetch("/api/progress").then(r => r.json()).then(d => {
      if (d.submissions) setAllSubmissions(d.submissions);
    });
  }, []);

  function resetCardState() {
    setUserCode("");
    setSubmitted(false);
    setRevealed(false);
    setShowSolution(false);
    setSelfRating(null);
    setShowHistory(false);
  }

  const topics = ["All", ...Array.from(new Set(questions.map(q => q.topic)))];
  const filtered = filterTopic === "All" ? questions : questions.filter(q => q.topic === filterTopic);
  const current = filtered[currentIdx % Math.max(filtered.length, 1)];
  const currentSubmissions: Submission[] = current ? (allSubmissions[current.id] ?? []) : [];
  const latestSubmission = currentSubmissions[0] ?? null;

  function navigateTo(newIdx: number) {
    if (current) setSeen(s => new Set(s).add(current.id));
    setCurrentIdx(newIdx);
    resetCardState();
    // Pre-fill self rating from existing latest submission
    const q = filtered[newIdx % Math.max(filtered.length, 1)];
    if (q) {
      const subs = allSubmissions[q.id] ?? [];
      if (subs[0]?.selfRating) setSelfRating(subs[0].selfRating);
    }
  }

  function next() { navigateTo((currentIdx + 1) % Math.max(filtered.length, 1)); }
  function prev() { navigateTo((currentIdx - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); }

  async function handleSubmitAttempt() {
    if (!current || saving) return;
    setSaving(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitAttempt", questionId: current.id, code: userCode }),
    });
    const data = await res.json();
    if (data.ok) {
      setAllSubmissions(prev => ({
        ...prev,
        [current.id]: [data.submission, ...(prev[current.id] ?? [])],
      }));
      setSubmitted(true);
    }
    setSaving(false);
  }

  async function handleReveal() {
    if (!current) return;
    setRevealed(true);
    setShowSolution(false);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRevealed", questionId: current.id }),
    });
    setAllSubmissions(prev => {
      const subs = [...(prev[current.id] ?? [])];
      if (subs.length) subs[0] = { ...subs[0], revealedAnswer: true };
      return { ...prev, [current.id]: subs };
    });
  }

  async function handleViewSolution() {
    if (!current) return;
    setShowSolution(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markViewedSolution", questionId: current.id }),
    });
    setAllSubmissions(prev => {
      const subs = [...(prev[current.id] ?? [])];
      if (subs.length) subs[0] = { ...subs[0], viewedSolution: true };
      return { ...prev, [current.id]: subs };
    });
  }

  async function handleRate(rating: SelfRating) {
    if (!current) return;
    setSelfRating(rating);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rateSubmission", questionId: current.id, rating }),
    });
    setAllSubmissions(prev => {
      const subs = [...(prev[current.id] ?? [])];
      if (subs.length) subs[0] = { ...subs[0], selfRating: rating };
      return { ...prev, [current.id]: subs };
    });
  }

  // Tab key in textarea inserts spaces
  function handleCodeKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = codeRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = userCode.slice(0, start) + "  " + userCode.slice(end);
      setUserCode(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  }

  if (!current) return <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>Loading questions…</div>;

  const seenCount = seen.size + (allSubmissions ? Object.keys(allSubmissions).length : 0);
  const pct = Math.min(Math.round((seenCount / filtered.length) * 100), 100);
  const hasHistory = currentSubmissions.length > 0;
  const hasCode = current.codeSolution != null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Daily Flashcards</h2>
          <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>Shuffled for {today} · {pct}% done</div>
        </div>
        <div className="progress-bar" style={{ width: 120 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Topic filter */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {topics.map(t => (
          <button key={t} onClick={() => { setFilterTopic(t); setCurrentIdx(0); resetCardState(); }}
            style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: filterTopic === t ? "var(--accent)" : "var(--surface)", color: filterTopic === t ? "white" : "var(--muted)", transition: "all 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Main Card ── */}
      <div className="card" style={{ marginBottom: "1rem" }}>

        {/* Card header: badges + index */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "var(--surface2)", color: TOPIC_COLORS[current.topic] || "var(--muted)", border: `1px solid ${TOPIC_COLORS[current.topic] || "var(--border)"}33` }}>
            {current.topic}
          </span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "var(--surface2)", color: DIFF_COLOR[current.difficulty] }}>
            {current.difficulty}
          </span>
          {hasCode && (
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 99, background: "#1e3a5f", color: "#93c5fd" }}>
              {"</>"} has solution
            </span>
          )}
          {hasHistory && (
            <button onClick={() => setShowHistory(v => !v)}
              style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 99, background: showHistory ? "var(--accent)" : "var(--surface2)", color: showHistory ? "white" : "var(--muted)", border: "1px solid var(--border)", cursor: "pointer" }}>
              🕑 {currentSubmissions.length} attempt{currentSubmissions.length !== 1 ? "s" : ""}
            </button>
          )}
          {latestSubmission?.selfRating && (
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 99, background: RATING_CONFIG[latestSubmission.selfRating].bg, color: RATING_CONFIG[latestSubmission.selfRating].color }}>
              {RATING_CONFIG[latestSubmission.selfRating].icon} {RATING_CONFIG[latestSubmission.selfRating].label}
            </span>
          )}
          <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "0.75rem" }}>
            {(currentIdx % filtered.length) + 1} / {filtered.length}
          </span>
        </div>

        {/* Question */}
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          {current.question}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {current.tags.map(tag => (
            <span key={tag} style={{ fontSize: "0.68rem", padding: "1px 8px", borderRadius: 99, background: "var(--surface2)", color: "var(--muted)" }}>#{tag}</span>
          ))}
        </div>

        {/* ── Code attempt editor (always shown) ── */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your Attempt
            </span>
            {submitted && (
              <span style={{ fontSize: "0.72rem", color: "var(--green)" }}>✓ Saved</span>
            )}
          </div>
          <div style={{ background: "#0d1117", borderRadius: 8, border: `1px solid ${submitted ? "#22c55e44" : "#30363d"}`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0.75rem", borderBottom: "1px solid #30363d" }}>
              <span style={{ fontSize: "0.7rem", color: "#8b949e" }}>
                {submitted ? "Submitted — reveal the answer to compare" : "Write your answer / pseudocode / code here"}
              </span>
              {userCode && !submitted && (
                <button onClick={() => setUserCode("")}
                  style={{ background: "transparent", border: "none", color: "#8b949e", cursor: "pointer", fontSize: "0.7rem" }}>
                  clear
                </button>
              )}
            </div>
            <textarea
              ref={codeRef}
              value={userCode}
              onChange={e => { if (!submitted) setUserCode(e.target.value); }}
              onKeyDown={handleCodeKeyDown}
              readOnly={submitted}
              placeholder={submitted ? "" : "// Write your answer, code, or pseudocode...\n// Tab key inserts 2 spaces\n// You can also just think it through and skip this"}
              rows={8}
              style={{
                width: "100%", padding: "0.75rem", background: "transparent",
                border: "none", color: submitted ? "#8b949e" : "#e6edf3",
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                fontSize: "0.8rem", lineHeight: 1.6, resize: "vertical",
                outline: "none", boxSizing: "border-box",
                opacity: submitted ? 0.7 : 1,
              }}
            />
          </div>

          {/* Submit / Reveal row */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            {!submitted ? (
              <>
                <button onClick={handleSubmitAttempt} disabled={saving}
                  className="btn btn-primary" style={{ flex: userCode ? 2 : 0 }}>
                  {saving ? "Saving…" : userCode ? "Submit Attempt" : "Submit (empty)"}
                </button>
                {!userCode && (
                  <button onClick={() => { setSubmitted(true); handleReveal(); }}
                    className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                    Skip & Reveal
                  </button>
                )}
              </>
            ) : !revealed ? (
              <button onClick={handleReveal} className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                Reveal Answer →
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Answer (shown after reveal) ── */}
        {revealed && (
          <div>
            <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "1rem", borderLeft: "3px solid var(--green)", marginBottom: "0.75rem" }}>
              <div style={{ color: "var(--green)", fontWeight: 700, fontSize: "0.72rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Answer</div>
              <p style={{ color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{current.answer}</p>
            </div>

            {/* Self-rating */}
            {!selfRating ? (
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.5rem", fontWeight: 600 }}>How did you do?</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {(["wrong", "partial", "correct"] as SelfRating[]).map(r => {
                    const cfg = RATING_CONFIG[r];
                    return (
                      <button key={r} onClick={() => handleRate(r)}
                        style={{ flex: 1, padding: "0.5rem", borderRadius: 8, border: `1px solid ${cfg.color}44`, background: cfg.bg, color: cfg.color, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                        <span style={{ fontSize: "1rem" }}>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.875rem", borderRadius: 8, background: RATING_CONFIG[selfRating].bg, marginBottom: "0.75rem" }}>
                <span style={{ color: RATING_CONFIG[selfRating].color, fontWeight: 700 }}>{RATING_CONFIG[selfRating].icon} {RATING_CONFIG[selfRating].label}</span>
                <button onClick={() => setSelfRating(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem" }}>change</button>
              </div>
            )}

            {/* Code solution gate */}
            {hasCode && (
              <div>
                {!showSolution ? (
                  <button onClick={handleViewSolution}
                    style={{ width: "100%", padding: "0.65rem 1rem", borderRadius: 8, border: "1px dashed #3178c6", background: "transparent", color: "#93c5fd", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    {"</>"} Show Code Solution
                  </button>
                ) : (
                  <div style={{ background: "#0d1117", borderRadius: 8, overflow: "hidden", border: "1px solid #30363d" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 1rem", borderBottom: "1px solid #30363d" }}>
                      <span style={{ color: "#8b949e", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reference Solution</span>
                      <button onClick={() => navigator.clipboard?.writeText(current.codeSolution!)}
                        style={{ background: "transparent", border: "none", color: "#8b949e", cursor: "pointer", fontSize: "0.72rem", padding: "2px 6px" }}>
                        copy
                      </button>
                    </div>
                    <pre style={{ margin: 0, padding: "1rem", overflowX: "auto", fontSize: "0.8rem", lineHeight: 1.6, color: "#e6edf3", fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}>
                      <code>{current.codeSolution}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Attempt History ── */}
      {showHistory && currentSubmissions.length > 0 && (
        <div className="card" style={{ marginBottom: "1rem", borderColor: "#334155" }}>
          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Attempt History</span>
            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.75rem" }}>{currentSubmissions.length} total</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {currentSubmissions.map((sub, i) => {
              const ratingCfg = sub.selfRating ? RATING_CONFIG[sub.selfRating] : null;
              return (
                <div key={sub.id} style={{ background: "var(--surface2)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                  {/* Submission header */}
                  <div style={{ padding: "0.5rem 0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", borderBottom: sub.code ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)" }}>
                      #{currentSubmissions.length - i}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                      {formatDate(sub.submittedAt)} · {timeAgo(sub.submittedAt)}
                    </span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                      {sub.revealedAnswer && <span style={{ fontSize: "0.65rem", color: "var(--green)", background: "#1c3a2a", padding: "1px 6px", borderRadius: 4 }}>revealed</span>}
                      {sub.viewedSolution && <span style={{ fontSize: "0.65rem", color: "#93c5fd", background: "#1e3a5f", padding: "1px 6px", borderRadius: 4 }}>saw solution</span>}
                      {ratingCfg && (
                        <span style={{ fontSize: "0.65rem", color: ratingCfg.color, background: ratingCfg.bg, padding: "1px 6px", borderRadius: 4 }}>
                          {ratingCfg.icon} {ratingCfg.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission code */}
                  {sub.code ? (
                    <pre style={{ margin: 0, padding: "0.75rem", overflowX: "auto", fontSize: "0.78rem", lineHeight: 1.6, color: "#8b949e", fontFamily: "'Fira Code', 'Cascadia Code', monospace", maxHeight: 200 }}>
                      <code>{sub.code}</code>
                    </pre>
                  ) : (
                    <div style={{ padding: "0.5rem 0.875rem", fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
                      No code written — thought it through
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={prev}>← Prev</button>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={next}>
          Next →
        </button>
      </div>

      {/* Questions list */}
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          All {filtered.length} Today&apos;s Questions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtered.map((q, i) => {
            const subs = allSubmissions[q.id] ?? [];
            const latest = subs[0];
            const isActive = currentIdx % filtered.length === i;
            return (
              <div key={q.id} onClick={() => { setCurrentIdx(i); resetCardState(); if (latest?.selfRating) setSelfRating(latest.selfRating); }}
                style={{ padding: "0.75rem 1rem", background: "var(--surface)", border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {/* Status icon */}
                  {latest?.selfRating
                    ? <span style={{ color: RATING_CONFIG[latest.selfRating].color, fontSize: "0.85rem", flexShrink: 0 }}>{RATING_CONFIG[latest.selfRating].icon}</span>
                    : subs.length > 0
                      ? <span style={{ color: "var(--amber)", fontSize: "0.75rem", flexShrink: 0 }}>○</span>
                      : <span style={{ color: "var(--border)", fontSize: "0.75rem", flexShrink: 0 }}>·</span>
                  }
                  {q.codeSolution && <span style={{ fontSize: "0.7rem", color: "#93c5fd", flexShrink: 0 }}>{"</>"}</span>}
                  <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {q.question}
                  </span>
                  <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", flexShrink: 0 }}>
                    {subs.length > 0 && <span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{subs.length}×</span>}
                    <span style={{ fontSize: "0.7rem", color: DIFF_COLOR[q.difficulty] }}>{q.difficulty}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
