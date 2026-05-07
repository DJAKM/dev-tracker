"use client";
import { ProgressData } from "@/lib/storage";
import { CURRICULUM, MONTH_NAMES } from "@/lib/curriculum";

interface Props {
  progress: ProgressData;
  today: string;
  dayNumber: number;
}

function isoDateFor(startDate: string, dayOffset: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

function getDayStatus(date: string, progress: ProgressData, today: string): "done" | "missed" | "future" | "today" {
  if (date > today) return "future";
  if (date === today) return "today";
  const tasks = progress.completions[date] || [];
  // Find day plan for this date
  if (!progress.startDate) return "future";
  const dayNum = Math.floor((new Date(date).getTime() - new Date(progress.startDate).getTime()) / 86400000) + 1;
  const plan = CURRICULUM.find(d => d.day === dayNum);
  if (!plan) return "missed";
  return tasks.length >= Math.ceil(plan.tasks.length * 0.5) ? "done" : "missed";
}

export default function StreakTab({ progress, today, dayNumber }: Props) {
  if (!progress.startDate) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
        Set your start date in the Today tab to see your streak.
      </div>
    );
  }

  // Current streak
  let streak = 0;
  let checkDate = new Date(today);
  while (true) {
    const ds = checkDate.toISOString().slice(0, 10);
    if (ds < progress.startDate) break;
    const dayNum = Math.floor((new Date(ds).getTime() - new Date(progress.startDate).getTime()) / 86400000) + 1;
    const plan = CURRICULUM.find(d => d.day === dayNum);
    if (!plan) { checkDate.setDate(checkDate.getDate() - 1); continue; }
    const completions = (progress.completions[ds] || []).length;
    if (completions >= Math.ceil(plan.tasks.length * 0.5)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Total completed days
  const totalDone = Object.keys(progress.completions).filter(d => {
    const dayNum = Math.floor((new Date(d).getTime() - new Date(progress.startDate!).getTime()) / 86400000) + 1;
    const plan = CURRICULUM.find(p => p.day === dayNum);
    if (!plan) return false;
    return (progress.completions[d] || []).length >= Math.ceil(plan.tasks.length * 0.5);
  }).length;

  // Month progress
  const months = [1, 2, 3, 4];
  const monthRanges = [{ start: 1, end: 30 }, { start: 31, end: 60 }, { start: 61, end: 90 }, { start: 91, end: 120 }];

  // Build 3-month rolling week grid
  const WEEKS_TO_SHOW = 14;
  const todayDate = new Date(today);
  const startGrid = new Date(todayDate);
  startGrid.setDate(startGrid.getDate() - (startGrid.getDay())); // Sunday of current week
  startGrid.setDate(startGrid.getDate() - (WEEKS_TO_SHOW - 1) * 7);

  const weeks: Array<Array<{ date: string; status: ReturnType<typeof getDayStatus> }>> = [];
  let cursor = new Date(startGrid);
  for (let w = 0; w < WEEKS_TO_SHOW; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const ds = cursor.toISOString().slice(0, 10);
      week.push({ date: ds, status: ds >= progress.startDate ? getDayStatus(ds, progress, today) : "future" as const });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Current Streak", value: `${streak} 🔥`, sub: streak === 1 ? "day" : "days" },
          { label: "Days Complete", value: totalDone, sub: `of ${Math.min(dayNumber, 120)} elapsed` },
          { label: "Program Day", value: Math.min(dayNumber, 120), sub: "of 120" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent)" }}>{s.value}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.7rem" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem", color: "var(--text)" }}>Activity — Last 14 Weeks</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
          {DOW.map(d => <div key={d} style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.65rem", fontWeight: 600 }}>{d}</div>)}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
            {week.map(({ date, status }) => {
              const bg = status === "done" ? "var(--green)" : status === "today" ? "var(--accent)" : status === "missed" ? "#7f1d1d" : "var(--surface2)";
              const title = `${date}: ${status}`;
              return (
                <div key={date} title={title} style={{ aspectRatio: "1", borderRadius: 4, background: bg, cursor: "default", border: status === "today" ? "1px solid var(--accent-hover)" : "none" }} />
              );
            })}
          </div>
        ))}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {[["var(--green)", "Done (50%+ tasks)"], ["var(--accent)", "Today"], ["#7f1d1d", "Missed"], ["var(--surface2)", "Future"]].map(([color, label]) => (
            <div key={label as string} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color as string }} />
              <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>{label as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Month progress bars */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem", color: "var(--text)" }}>Month Progress</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {months.map((m, i) => {
            const range = monthRanges[i];
            const monthDays = CURRICULUM.filter(d => d.month === m);
            const completedInMonth = monthDays.filter(plan => {
              if (!progress.startDate) return false;
              const date = isoDateFor(progress.startDate, plan.day - 1);
              if (date > today) return false;
              const completions = (progress.completions[date] || []).length;
              return completions >= Math.ceil(plan.tasks.length * 0.5);
            }).length;
            const pct = Math.round((completedInMonth / monthDays.length) * 100);
            const isActive = dayNumber >= range.start && dayNumber <= range.end;
            const isDone = dayNumber > range.end;
            return (
              <div key={m}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: isActive ? "var(--text)" : "var(--muted)" }}>
                    {MONTH_NAMES[i]}
                    {isActive && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "var(--accent)", color: "white", padding: "1px 6px", borderRadius: 99 }}>Active</span>}
                    {isDone && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "var(--green)", color: "#052e16", padding: "1px 6px", borderRadius: 99 }}>Done</span>}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{completedInMonth}/{monthDays.length} days · {pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: isDone ? "var(--green)" : isActive ? "var(--accent)" : "var(--border)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
