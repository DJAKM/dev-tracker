"use client";
import { useState } from "react";
import { DayPlan, MONTH_NAMES, getDayPlan } from "@/lib/curriculum";
import { ProgressData } from "@/lib/storage";
import ConfirmDialog from "@/components/ConfirmDialog";
import ArticleViewer from "@/components/ArticleViewer";
import { getArticle } from "@/lib/articles";

interface Props {
  today: string;
  yesterday: string;
  dayNumber: number;
  plan: DayPlan | null;
  progress: ProgressData;
  missedYesterday: boolean;
  onToggleTask: (taskId: string, date: string) => void;
  onSetStart: (date: string) => void;
  onResetStart: () => void;
  onMarkArticleRead: (dayNumber: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  DSA: "badge-dsa", UI: "badge-ui", Reading: "badge-reading",
  State: "badge-state", Testing: "badge-testing", Project: "badge-project",
  Interview: "badge-interview", Apply: "badge-apply", Review: "badge-reading",
};

function dateFromDayNum(startDate: string, dayNum: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayNum - 1);
  return d.toISOString().slice(0, 10);
}

function dayNumFromDate(startDate: string, date: string): number {
  const s = new Date(startDate); const t = new Date(date);
  s.setHours(0,0,0,0); t.setHours(0,0,0,0);
  return Math.floor((t.getTime() - s.getTime()) / 86400000) + 1;
}

type DialogType =
  | "setStart"
  | "resetStart"
  | "togglePastTask"
  | "toggleFutureTask"
  | null;

export default function TodayTab({
  today, yesterday, dayNumber, plan, progress,
  missedYesterday, onToggleTask, onSetStart, onResetStart, onMarkArticleRead,
}: Props) {
  const [startInput, setStartInput] = useState(today);

  // Day navigation: null = today, otherwise a day number offset from today
  const [viewingDay, setViewingDay] = useState<number>(dayNumber);

  // Article overlay
  const [showArticle, setShowArticle] = useState(false);

  // Confirmation dialog state
  const [dialog, setDialog] = useState<{
    type: DialogType;
    payload?: { taskId: string; date: string; wasDone: boolean };
    startDate?: string;
  } | null>(null);

  // Sync viewingDay to actual today when dayNumber changes
  const todayDayNum = dayNumber;

  const viewDate = progress.startDate
    ? dateFromDayNum(progress.startDate, viewingDay)
    : today;
  const viewPlan = getDayPlan(viewingDay);
  const completionsForView = progress.completions[viewDate] || [];
  const isViewingToday = viewingDay === todayDayNum;
  const isViewingPast = viewDate < today;
  const isViewingFuture = viewDate > today;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleSetStart() {
    setDialog({ type: "setStart", startDate: startInput });
  }

  function handleResetStart() {
    setDialog({ type: "resetStart" });
  }

  function handleTaskClick(taskId: string) {
    const wasDone = completionsForView.includes(taskId);
    if (isViewingFuture) {
      setDialog({ type: "toggleFutureTask", payload: { taskId, date: viewDate, wasDone } });
      return;
    }
    if (isViewingPast) {
      setDialog({ type: "togglePastTask", payload: { taskId, date: viewDate, wasDone } });
      return;
    }
    // today — no confirm needed
    onToggleTask(taskId, viewDate);
  }

  function handleConfirm() {
    if (!dialog) return;
    if (dialog.type === "setStart" && dialog.startDate) {
      onSetStart(dialog.startDate);
    }
    if (dialog.type === "resetStart") {
      onResetStart();
    }
    if ((dialog.type === "togglePastTask" || dialog.type === "toggleFutureTask") && dialog.payload) {
      onToggleTask(dialog.payload.taskId, dialog.payload.date);
    }
    setDialog(null);
  }

  // ─── Dialog configs ────────────────────────────────────────────────────────

  const dialogConfig = (() => {
    if (!dialog) return null;
    if (dialog.type === "setStart") return {
      title: "Confirm start date",
      message: `Set your Day 1 to ${dialog.startDate}? This determines your entire 4-month schedule. You can change it later but it will shift all your day numbers.`,
      confirmLabel: "Yes, start here",
      danger: false,
    };
    if (dialog.type === "resetStart") return {
      title: "Change start date?",
      message: "Changing your start date will shift all day numbers. Your existing task completions will stay, but they may no longer align with the right days. Are you sure?",
      confirmLabel: "Change it",
      danger: true,
    };
    if (dialog.type === "togglePastTask") {
      const { wasDone } = dialog.payload!;
      return {
        title: wasDone ? "Unmark past task?" : "Mark past task as done?",
        message: wasDone
          ? `You're editing a task from ${viewDate} (a past day). Unmarking it will lower that day's completion. Continue?`
          : `You're marking a task from ${viewDate} as done retroactively. This is fine if you actually did it — just being sure. Continue?`,
        confirmLabel: wasDone ? "Unmark it" : "Mark as done",
        danger: wasDone,
      };
    }
    if (dialog.type === "toggleFutureTask") return {
      title: "Marking a future task?",
      message: `Day ${viewingDay} (${viewDate}) hasn't happened yet. Are you sure you want to pre-mark this task?`,
      confirmLabel: "Yes, mark it",
      danger: false,
    };
    return null;
  })();

  // ─── Setup screen ──────────────────────────────────────────────────────────

  if (!progress.startDate) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
        <h2 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Start Your 4-Month Journey
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "0.75rem" }}>
          Pick your Day 1. This anchors your entire 120-day schedule.
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "2rem" }}>
          💡 If you already started studying and want credit for past days, set it to a past date.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="date"
            value={startInput}
            max={today}
            onChange={e => setStartInput(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "1rem" }}
          />
          <button className="btn btn-primary" onClick={handleSetStart}>
            Begin →
          </button>
        </div>

        <ConfirmDialog
          open={dialog?.type === "setStart"}
          title={dialogConfig?.title ?? ""}
          message={dialogConfig?.message ?? ""}
          confirmLabel={dialogConfig?.confirmLabel}
          danger={dialogConfig?.danger}
          onConfirm={handleConfirm}
          onCancel={() => setDialog(null)}
        />
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

  // ─── Main view ─────────────────────────────────────────────────────────────

  const canGoPrev = viewingDay > 1;
  const canGoNext = viewingDay < Math.min(todayDayNum + 7, 120); // allow up to 7 days ahead preview

  return (
    <div>
      {/* Missed yesterday alert */}
      {missedYesterday && isViewingToday && (
        <div style={{ background: "#3b1a1a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "0.85rem 1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem" }}>⚠️</span>
            <div>
              <div style={{ color: "#fca5a5", fontWeight: 600, fontSize: "0.875rem" }}>Missed yesterday ({yesterday})</div>
              <div style={{ color: "#f87171", fontSize: "0.8rem" }}>Go back and log what you did, or start fresh today.</div>
            </div>
          </div>
          <button
            onClick={() => setViewingDay(todayDayNum - 1)}
            style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #7f1d1d", background: "transparent", color: "#fca5a5", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            Go back →
          </button>
        </div>
      )}

      {/* Past / future banner */}
      {!isViewingToday && (
        <div style={{
          background: isViewingPast ? "#1c3a2a" : "#1e3a5f",
          border: `1px solid ${isViewingPast ? "#166534" : "#1d4ed8"}`,
          borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
        }}>
          <span style={{ color: isViewingPast ? "#86efac" : "#93c5fd", fontSize: "0.82rem", fontWeight: 600 }}>
            {isViewingPast
              ? `📅 Viewing past day — ${viewDate}. Changes here are retroactive.`
              : `🔭 Previewing future day — ${viewDate}. Nothing is due yet.`}
          </span>
          <button
            onClick={() => setViewingDay(todayDayNum)}
            style={{ padding: "3px 10px", borderRadius: 8, border: `1px solid ${isViewingPast ? "#166534" : "#1d4ed8"}`, background: "transparent", color: isViewingPast ? "#86efac" : "#93c5fd", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            Back to today
          </button>
        </div>
      )}

      {/* Day header + navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {/* Prev day */}
        <button
          onClick={() => canGoPrev && setViewingDay(v => v - 1)}
          disabled={!canGoPrev}
          title="Previous day"
          style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: canGoPrev ? "var(--text)" : "var(--border)", cursor: canGoPrev ? "pointer" : "not-allowed", fontSize: "1rem", flexShrink: 0 }}>
          ←
        </button>

        {/* Day info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginBottom: "1px" }}>
            {viewPlan ? `${MONTH_NAMES[(viewPlan.month) - 1]} · Week ${viewPlan.week}` : "—"}
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Day {viewingDay} — {viewPlan?.theme ?? "Rest Day"}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{viewDate}</div>
        </div>

        {/* Completion count */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: completionsForView.length === (viewPlan?.tasks.length ?? 0) && viewPlan ? "var(--green)" : "var(--accent)" }}>
            {completionsForView.length}/{viewPlan?.tasks.length ?? 0}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.7rem" }}>done</div>
        </div>

        {/* Next day */}
        <button
          onClick={() => canGoNext && setViewingDay(v => v + 1)}
          disabled={!canGoNext}
          title="Next day"
          style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: canGoNext ? "var(--text)" : "var(--border)", cursor: canGoNext ? "pointer" : "not-allowed", fontSize: "1rem", flexShrink: 0 }}>
          →
        </button>
      </div>

      {/* Jump to today pill */}
      {!isViewingToday && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={() => setViewingDay(todayDayNum)}
            style={{ padding: "4px 16px", borderRadius: 99, border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            Jump to today (Day {todayDayNum})
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="progress-fill" style={{
          width: `${viewPlan ? (completionsForView.length / viewPlan.tasks.length) * 100 : 0}%`,
          background: completionsForView.length === (viewPlan?.tasks.length ?? 0) && viewPlan ? "var(--green)" : "var(--accent)",
        }} />
      </div>

      {/* Tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {viewPlan?.tasks.map(task => {
          const done = completionsForView.includes(task.id);
          return (
            <div key={task.id} className="card"
              style={{ opacity: done ? 0.7 : 1, borderColor: done ? "var(--green)" : "var(--border)", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => handleTaskClick(task.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <input type="checkbox" checked={done}
                  onChange={() => handleTaskClick(task.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ marginTop: 2, flexShrink: 0 }} />
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

        {!viewPlan && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
            No tasks planned for this day.
          </div>
        )}
      </div>

      {/* Article of the day */}
      {(() => {
        const article = getArticle(viewingDay);
        const isRead = !!progress.articlesRead?.[String(viewingDay)];
        if (!article) return null;
        return (
          <>
            <div className="card" style={{ borderColor: isRead ? "var(--green)" : "#1e3a5f", marginBottom: "1rem", cursor: "pointer", transition: "border-color 0.15s" }}
              onClick={() => setShowArticle(true)}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.1rem" }}>📖</span>
                <span style={{ color: isRead ? "var(--green)" : "var(--blue)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isRead ? "Read ✓" : "Article of the Day"}
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: "auto" }}>{article.readTime} read</span>
              </div>
              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                {article.title}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>{article.tldr}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={e => { e.stopPropagation(); setShowArticle(true); }}
                  className="btn btn-primary"
                  style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                  {isRead ? "Read again" : "Read now →"}
                </button>
                {!isRead && (
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Includes quiz questions</span>
                )}
              </div>
            </div>

            {showArticle && (
              <ArticleViewer
                article={article}
                alreadyRead={isRead}
                onClose={() => setShowArticle(false)}
                onComplete={() => {
                  setShowArticle(false);
                  onMarkArticleRead(viewingDay);
                }}
              />
            )}
          </>
        );
      })()}

      {/* Change start date */}
      <div className="card" style={{ marginTop: "0.5rem", borderStyle: "dashed" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)" }}>Program started</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text)" }}>{progress.startDate}</div>
          </div>
          <button
            onClick={handleResetStart}
            style={{ padding: "4px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            Change start date
          </button>
        </div>

        {dialog?.type === "resetStart" && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <input
              type="date"
              defaultValue={progress.startDate ?? today}
              max={today}
              id="resetDateInput"
              style={{ padding: "0.4rem 0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: "0.875rem", marginBottom: "0.5rem", width: "100%" }}
              onChange={e => {
                setDialog(d => d ? { ...d, startDate: e.target.value } : null);
              }}
            />
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={dialog !== null && dialog.type !== null}
        title={dialogConfig?.title ?? ""}
        message={dialogConfig?.message ?? ""}
        confirmLabel={dialogConfig?.confirmLabel}
        danger={dialogConfig?.danger}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
