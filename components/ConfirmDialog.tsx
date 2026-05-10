"use client";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel",
  danger = false, onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 200, backdropFilter: "blur(2px)",
        }}
      />
      {/* Dialog */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 201, width: "calc(100% - 2rem)", maxWidth: 400,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "1.5rem", boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.6rem" }}>
          {title}
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 1.5rem 0" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "0.5rem 1.1rem", borderRadius: 8, border: "1px solid var(--border)",
              background: "transparent", color: "var(--muted)", fontWeight: 600,
              fontSize: "0.875rem", cursor: "pointer",
            }}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: 8, border: "none",
              background: danger ? "var(--red)" : "var(--accent)",
              color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
            }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
