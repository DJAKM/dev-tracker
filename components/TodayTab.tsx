"use client";
import { useState } from "react";
import { DayPlan, MONTH_NAMES } from "@/lib/curriculum";
import { ProgressData } from "@/lib/storage";

interface Props {
  today: string;
  yesterday: string;
  dayNumber: number;
  plan: DayPlan | null;
  progress: ProgressData;
  missedYesterday: boolean;
  onToggleTask: (taskId: string) => void;
  onSetStart: (date: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  DSA: "badge-dsa", UI: "badge-ui", Reading: "badge-reading",
  State: "badge-state", Testing: "badge-testing", Project: "badge-project",
  Interview: "badge-interview", Apply: "badge-apply", Review: "badge-reading",
};

export default function TodayTab({ today, yesterday, dayNumber, plan, progress, missedYesterday, onToggleTask, onSetStart }: Props) {
  const [startInput, setStartInput] = useState(today);
  const completedToday = progress.completions[today] || [];

  if (!progress.startDate) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
        <h2 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Start Your 4-Month Journey</h2>
        <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>Set your program start date. Day 1 = first day you want to track.</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", alignItems: "center" }}>
          <input
            type="date"
            value={startInput}
            onChange={e => setStartInput(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "1rem" }}
          />
          <button className="btn btn-primary" onClick={() => onSetStart(startInput)}>
            Begin →
          </button>
        </div>
      </div>
    );
  }

  if (dayNumber < 1) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--muted)" }}>Program starts on {progress.startDate}. Check back then!</p>
      </div>
    );
  }

  if (dayNumber > 120) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ color: "var(--text)", fontWeight: 700, fontSize: "1.5rem" }}>Program Complete!</h2>
        <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>You finished all 120 days. Time to land that job!</p>
      </div>
    );
  }

  return (
    <div>
      {missedYesterday && (
        <div style={{ background: "#3b1a1a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "0.85rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>⚠️</span>
          <div>
            <div style={{ color: "#fca5a5", fontWeight: 600, fontSize: "0.875rem" }}>Missed yesterday ({yesterday})</div>
            <div style={{ color: "#f87171", fontSize: "0.8rem" }}>Don&apos;t break your streak — start today strong.</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "2px" }}>
            {MONTH_NAMES[(plan?.month ?? 1) - 1]} · Week {plan?.week}
          </div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
            Day {dayNumber} — {plan?.theme ?? "Rest Day"}
          </h2>
          <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 2 }}>{today}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>{completedToday.length}/{plan?.tasks.length ?? 0}</div>
          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>tasks done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="progress-fill" style={{ width: `${plan ? (completedToday.length / plan.tasks.length) * 100 : 0}%`, background: completedToday.length === (plan?.tasks.length ?? 0) ? "var(--green)" : "var(--accent)" }} />
      </div>

      {/* Tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {plan?.tasks.map(task => {
          const done = completedToday.includes(task.id);
          return (
            <div key={task.id} className="card" style={{ opacity: done ? 0.7 : 1, borderColor: done ? "var(--green)" : "var(--border)", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => onToggleTask(task.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <input type="checkbox" checked={done} onChange={() => onToggleTask(task.id)} onClick={e => e.stopPropagation()} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                    <span className={`badge ${CATEGORY_COLORS[task.category] ?? "badge-dsa"}`}>{task.category}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: done ? "var(--muted)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                      {task.title}
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: "0 0 0.5rem 0", lineHeight: 1.5 }}>{task.description}</p>
                  {task.links.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {task.links.map(link => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none", padding: "2px 8px", border: "1px solid var(--accent)", borderRadius: 4, opacity: 0.9 }}>
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article of the day */}
      {plan?.article && (
        <div className="card" style={{ borderColor: "#1e3a5f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>📖</span>
            <span style={{ color: "var(--blue)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Article of the Day</span>
            <span style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: "auto" }}>{plan.article.readTime} read</span>
          </div>
          <a href={plan.article.url} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", display: "block", marginBottom: "0.25rem" }}>
            {plan.article.title} ↗
          </a>
          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{plan.article.source}</div>
        </div>
      )}
    </div>
  );
}
