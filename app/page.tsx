"use client";
import { useState, useEffect, useCallback } from "react";
import { ProgressData } from "@/lib/storage";
import { getDayPlan } from "@/lib/curriculum";
import TodayTab from "@/components/TodayTab";
import StreakTab from "@/components/StreakTab";
import QuestionsTab from "@/components/QuestionsTab";
import RoadmapTab from "@/components/RoadmapTab";

type Tab = "today" | "streak" | "questions" | "roadmap";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "today", label: "Today", icon: "📅" },
  { id: "streak", label: "Streak", icon: "🔥" },
  { id: "questions", label: "Questions", icon: "🧠" },
  { id: "roadmap", label: "Roadmap", icon: "🗺️" },
];

function getToday() { return new Date().toISOString().slice(0, 10); }
function getYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }
function getDayNum(startDate: string) {
  const s = new Date(startDate); const t = new Date(); s.setHours(0,0,0,0); t.setHours(0,0,0,0);
  return Math.floor((t.getTime() - s.getTime()) / 86400000) + 1;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [progress, setProgress] = useState<ProgressData>({ startDate: null, completions: {}, questionsSeen: {} });
  const [loading, setLoading] = useState(true);

  const today = getToday();
  const yesterday = getYesterday();
  const dayNumber = progress.startDate ? getDayNum(progress.startDate) : 0;
  const plan = progress.startDate ? getDayPlan(dayNumber) : null;

  // Check if yesterday was missed
  const missedYesterday = (() => {
    if (!progress.startDate || dayNumber < 2) return false;
    const yNum = dayNumber - 1;
    const yPlan = getDayPlan(yNum);
    if (!yPlan) return false;
    const yCompletions = (progress.completions[yesterday] || []).length;
    return yCompletions < Math.ceil(yPlan.tasks.length * 0.5);
  })();

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/progress");
      const data = await res.json();
      setProgress(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  async function handleToggleTask(taskId: string) {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleTask", date: today, taskId }),
    });
    const data = await res.json();
    if (data.ok) {
      setProgress(prev => ({
        ...prev,
        completions: { ...prev.completions, [today]: data.completions },
      }));
    }
  }

  async function handleSetStart(date: string) {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setStartDate", date }),
    });
    fetchProgress();
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
          <div style={{ color: "var(--muted)" }}>Loading tracker…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1rem 6rem 1rem", minHeight: "100vh" }}>
      {/* Top header */}
      <div style={{ padding: "1.25rem 0 1rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text)" }}>DevTracker</div>
          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
            {progress.startDate ? `Day ${Math.max(dayNumber, 0)} of 120` : "4-Month Career Plan"}
          </div>
        </div>
        {progress.startDate && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{today}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
              {plan ? `${(progress.completions[today] || []).length}/${plan.tasks.length} done` : "—"}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {tab === "today" && (
          <TodayTab today={today} yesterday={yesterday} dayNumber={dayNumber} plan={plan} progress={progress} missedYesterday={missedYesterday} onToggleTask={handleToggleTask} onSetStart={handleSetStart} />
        )}
        {tab === "streak" && (
          <StreakTab progress={progress} today={today} dayNumber={dayNumber} />
        )}
        {tab === "questions" && (
          <QuestionsTab today={today} />
        )}
        {tab === "roadmap" && (
          <RoadmapTab progress={progress} today={today} dayNumber={dayNumber} />
        )}
      </div>

      {/* Bottom tab bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", zIndex: 50 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "0.75rem 0.5rem", background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", borderTop: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`, transition: "all 0.15s" }}>
            <span style={{ fontSize: "1.25rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: tab === t.id ? "var(--accent)" : "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
