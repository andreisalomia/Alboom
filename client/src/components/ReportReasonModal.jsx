import { useState, useEffect } from "react";

export default function ReportReasonModal({ open, onSend, onCancel }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", padding: "2rem", borderRadius: 10, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.15)"
      }}>
        <h3 style={{ marginTop: 0 }}>Report</h3>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: "1rem" }}
          placeholder="Describe the reason for reporting (optional)"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel} style={{ padding: "0.5rem 1.2rem" }}>Cancel</button>
          <button
            onClick={() => onSend(reason)}
            style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: 4, padding: "0.5rem 1.2rem" }}
          >
            Send Report
          </button>
        </div>
      </div>
    </div>
  );
}