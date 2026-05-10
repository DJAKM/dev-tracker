"use client";
import { useState, useEffect } from "react";
import { Question, getDailyQuestions } from "@/lib/questions";

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

export default function QuestionsTab({ today }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [filterTopic, setFilterTopic] = useState("All");

  useEffect(() => {
    setQuestions(getDailyQuestions(today, 15));
    setCurrentIdx(0);
    setRevealed(false);
    setShowSolution(false);
  }, [today]);

  const topics = ["All", ...Array.from(new Set(questions.map(q => q.topic)))];
  const filtered = filterTopic === "All" ? questions : questions.filter(q => q.topic === filterTopic);
  const current = filtered[currentIdx % Math.max(filtered.length, 1)];

  function next() {
    if (current) setSeen(s => new Set(s).add(current.id));
    setCurrentIdx(i => (i + 1) % Math.max(filtered.length, 1));
    setRevealed(false);
    setShowSolution(false);
  }

  function prev() {
    setCurrentIdx(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
    setRevealed(false);
    setShowSolution(false);
  }

  function handleReveal() {
    setRevealed(true);
    setShowSolution(false); // reset — they need to explicitly ask for solution
  }

  if (!current) return <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>Loading questions…</div>;

  const seenCount = seen.size;
  const pct = Math.round((seenCount / filtered.length) * 100);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Daily Flashcards</h2>
          <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>Shuffled for {today} · {seenCount}/{filtered.length} seen</div>
        </div>
        <div className="progress-bar" style={{ width: 120 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Topic filter */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {topics.map(t => (
          <button key={t} onClick={() => { setFilterTopic(t); setCurrentIdx(0); setRevealed(false); setShowSolution(false); }}
            style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)", background: filterTopic === t ? "var(--accent)" : "var(--surface)", color: filterTopic === t ? "white" : "var(--muted)", transition: "all 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="card" style={{ minHeight: 340, display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "var(--surface2)", color: TOPIC_COLORS[current.topic] || "var(--muted)", border: `1px solid ${TOPIC_COLORS[current.topic] || "var(--border)"}33` }}>
            {current.topic}
          </span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "var(--surface2)", color: DIFF_COLOR[current.difficulty] }}>
            {current.difficulty}
          </span>
          {current.codeSolution && (
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 99, background: "#1e3a5f", color: "#93c5fd" }}>
              has solution
            </span>
          )}
          <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "0.75rem" }}>{(currentIdx % filtered.length) + 1} / {filtered.length}</span>
        </div>

        <div style={{ flex: 1 }}>
          {/* Question */}
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.6, marginBottom: "1rem" }}>
            {current.question}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {current.tags.map(tag => (
              <span key={tag} style={{ fontSize: "0.68rem", padding: "1px 8px", borderRadius: 99, background: "var(--surface2)", color: "var(--muted)" }}>#{tag}</span>
            ))}
          </div>

          {/* Reveal / Answer */}
          {!revealed ? (
            <div>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginBottom: "0.75rem", padding: "0.6rem 0.875rem", background: "var(--surface2)", borderRadius: 8, borderLeft: "3px solid var(--amber)" }}>
                💡 Try to answer in your head first, then reveal.
              </div>
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }} onClick={handleReveal}>
                Reveal Answer
              </button>
            </div>
          ) : (
            <div>
              {/* Answer */}
              <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "1rem", borderLeft: "3px solid var(--green)", marginBottom: "0.75rem" }}>
                <div style={{ color: "var(--green)", fontWeight: 700, fontSize: "0.72rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Answer</div>
                <p style={{ color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{current.answer}</p>
              </div>

              {/* Solution unlock — only if question has one */}
              {current.codeSolution && (
                <div>
                  {!showSolution ? (
                    <button
                      onClick={() => setShowSolution(true)}
                      style={{ width: "100%", padding: "0.65rem 1rem", borderRadius: 8, border: "1px dashed #3178c6", background: "transparent", color: "#93c5fd", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <span>{"</>"}</span> Show Code Solution
                    </button>
                  ) : (
                    <div style={{ background: "#0d1117", borderRadius: 8, overflow: "hidden", border: "1px solid #30363d" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 1rem", borderBottom: "1px solid #30363d" }}>
                        <span style={{ color: "#8b949e", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>JavaScript Solution</span>
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
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={prev}>← Prev</button>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={next}>
          {seen.has(current.id) ? "Next →" : "Got it →"}
        </button>
      </div>

      {/* All questions list */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          All {filtered.length} Today&apos;s Questions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtered.map((q, i) => (
            <div key={q.id} onClick={() => { setCurrentIdx(i); setRevealed(false); setShowSolution(false); }}
              style={{ padding: "0.75rem 1rem", background: "var(--surface)", border: `1px solid ${currentIdx % filtered.length === i ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s", opacity: seen.has(q.id) ? 0.6 : 1 }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {seen.has(q.id) && <span style={{ color: "var(--green)", fontSize: "0.8rem", flexShrink: 0 }}>✓</span>}
                {q.codeSolution && <span style={{ fontSize: "0.7rem", color: "#93c5fd", flexShrink: 0 }}>{"</>"}</span>}
                <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.question}</span>
                <span style={{ fontSize: "0.7rem", color: DIFF_COLOR[q.difficulty], flexShrink: 0 }}>{q.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
