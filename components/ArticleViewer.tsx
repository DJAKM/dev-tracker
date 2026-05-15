"use client";
import { useState } from "react";
import { Article, ArticleSection, QuizOption } from "@/lib/articles";

interface Props {
  article: Article;
  onClose: () => void;
  onComplete: () => void;
  alreadyRead: boolean;
}

// ─── Quiz Section ─────────────────────────────────────────────────────────────
function QuizBlock({ section }: { section: ArticleSection }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div style={{ background: "#1a2332", borderRadius: 10, padding: "1rem", border: "1px solid #334155", marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
        Quick Check
      </div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.6, marginBottom: "1rem", whiteSpace: "pre-wrap", fontFamily: section.question?.includes("\n") ? "monospace" : "inherit" }}>
        {section.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {section.options?.map((opt: QuizOption, i: number) => {
          const isSelected = selected === i;
          const showResult = answered;
          const isCorrect = opt.correct;
          let bg = "var(--surface2)";
          let border = "1px solid var(--border)";
          let color = "var(--text)";
          if (showResult && isSelected && isCorrect) { bg = "#1c3a2a"; border = "1px solid #22c55e"; color = "#22c55e"; }
          if (showResult && isSelected && !isCorrect) { bg = "#3b1a1a"; border = "1px solid #ef4444"; color = "#ef4444"; }
          if (showResult && !isSelected && isCorrect) { bg = "#1c3a2a33"; border = "1px dashed #22c55e"; color = "#86efac"; }

          return (
            <div key={i}>
              <button
                onClick={() => !answered && setSelected(i)}
                disabled={answered}
                style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: 8, background: bg, border, color, fontSize: "0.83rem", cursor: answered ? "default" : "pointer", textAlign: "left", transition: "all 0.15s", fontWeight: isSelected ? 600 : 400 }}>
                <span style={{ opacity: 0.5, marginRight: "0.5rem" }}>{String.fromCharCode(65 + i)}.</span>
                {opt.text}
              </button>
              {showResult && (isSelected || isCorrect) && (
                <div style={{ padding: "0.4rem 0.875rem 0.5rem", fontSize: "0.78rem", color: isCorrect ? "#86efac" : "#fca5a5", lineHeight: 1.5 }}>
                  {isCorrect ? "✓ " : "✗ "}{opt.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ section }: { section: ArticleSection }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(section.code ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div style={{ background: "#0d1117", borderRadius: 8, overflow: "hidden", border: "1px solid #30363d", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.4rem 0.875rem", borderBottom: "1px solid #30363d" }}>
        {section.title && <span style={{ color: "#8b949e", fontSize: "0.72rem", fontWeight: 600 }}>{section.title}</span>}
        <button onClick={copy} style={{ marginLeft: "auto", background: "transparent", border: "none", color: copied ? "#22c55e" : "#8b949e", cursor: "pointer", fontSize: "0.72rem", padding: "2px 6px" }}>
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <pre style={{ margin: 0, padding: "1rem", overflowX: "auto", fontSize: "0.8rem", lineHeight: 1.7, color: "#e6edf3", fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}>
        <code>{section.code}</code>
      </pre>
    </div>
  );
}

// ─── Visual Block ─────────────────────────────────────────────────────────────
function VisualBlock({ section }: { section: ArticleSection }) {
  return (
    <div style={{ background: "#0d1117", borderRadius: 8, border: "1px solid #30363d", marginBottom: "1rem", overflow: "hidden" }}>
      {section.title && (
        <div style={{ padding: "0.4rem 0.875rem", borderBottom: "1px solid #30363d", color: "#8b949e", fontSize: "0.72rem", fontWeight: 600 }}>{section.title}</div>
      )}
      <pre style={{ margin: 0, padding: "1rem", fontSize: "0.8rem", lineHeight: 1.7, color: "#a5f3fc", fontFamily: "'Fira Code', 'Cascadia Code', monospace", whiteSpace: "pre-wrap", overflowX: "auto" }}>
        {section.content}
      </pre>
    </div>
  );
}

// ─── Callout ─────────────────────────────────────────────────────────────────
function Callout({ section }: { section: ArticleSection }) {
  const configs = {
    tip:     { icon: "💡", color: "#f59e0b", bg: "#3b2a14", border: "#92400e" },
    warning: { icon: "⚠️", color: "#ef4444", bg: "#3b1a1a", border: "#991b1b" },
    insight: { icon: "🔑", color: "#6366f1", bg: "#1e1b4b", border: "#3730a3" },
  };
  const cfg = configs[section.calloutType ?? "tip"];
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{cfg.icon}</span>
      <p style={{ margin: 0, color: cfg.color, fontSize: "0.875rem", lineHeight: 1.6 }}>{section.content}</p>
    </div>
  );
}

// ─── Key Points ───────────────────────────────────────────────────────────────
function KeyPoints({ section }: { section: ArticleSection }) {
  return (
    <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "1rem", marginBottom: "1rem", border: "1px solid var(--border)" }}>
      {section.title && <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text)", marginBottom: "0.75rem" }}>{section.title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {section.points?.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span style={{ color: "var(--accent)", flexShrink: 0, fontSize: "0.8rem", marginTop: 2 }}>→</span>
            <span style={{ color: "var(--text)", fontSize: "0.83rem", lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Concept ─────────────────────────────────────────────────────────────────
function ConceptBlock({ section }: { section: ArticleSection }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {section.title && <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.4rem" }}>{section.title}</div>}
      <p style={{ color: "#cbd5e1", fontSize: "0.875rem", lineHeight: 1.75, margin: 0 }}>{section.content}</p>
    </div>
  );
}

// ─── Section Router ───────────────────────────────────────────────────────────
function Section({ section }: { section: ArticleSection }) {
  switch (section.type) {
    case "quiz":      return <QuizBlock section={section} />;
    case "code":      return <CodeBlock section={section} />;
    case "visual":    return <VisualBlock section={section} />;
    case "callout":   return <Callout section={section} />;
    case "keypoints": return <KeyPoints section={section} />;
    default:          return <ConceptBlock section={section} />;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ArticleViewer({ article, onClose, onComplete, alreadyRead }: Props) {
  const [completed, setCompleted] = useState(alreadyRead);

  function handleComplete() {
    setCompleted(true);
    onComplete();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0, background: "var(--surface)" }}>
        <button onClick={onClose}
          style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.25rem", padding: "0 0.25rem", lineHeight: 1 }}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{article.title}</div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{article.readTime} read · {article.sections.filter(s => s.type === "quiz").length} quick checks</div>
        </div>
        {completed && <span style={{ fontSize: "0.72rem", color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓ Read</span>}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1rem 6rem 1rem" }}>
        {/* TLDR */}
        <div style={{ background: "#1e293b", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: "1.5rem", borderLeft: "3px solid var(--accent)" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>TL;DR</div>
          <p style={{ margin: 0, color: "var(--text)", fontSize: "0.875rem", lineHeight: 1.6, fontWeight: 500 }}>{article.tldr}</p>
        </div>

        {/* Sections */}
        {article.sections.map((section, i) => (
          <Section key={i} section={section} />
        ))}

        {/* Complete button */}
        {!completed ? (
          <button onClick={handleComplete} className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.875rem", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            ✓ Mark as Read
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "1rem", color: "var(--green)", fontWeight: 600, fontSize: "0.875rem" }}>
            ✓ Done! Great work on Day {article.id.replace("day-", "")}.
          </div>
        )}
      </div>
    </div>
  );
}
