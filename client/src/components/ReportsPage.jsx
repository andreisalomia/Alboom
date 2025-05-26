import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      navigate("/");
      return;
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/reports", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReports(data);
    } catch {
      setReports([]);
    }
    setLoading(false);
  };

  const handleDeleteContent = async (report) => {
    try {
      let endpoint = "";
      switch (report.type) {
        case "comment":
          endpoint = `/api/comments/${report.targetId}`;
          break;
        case "review":
          endpoint = `/api/reviews/${report.targetId}`;
          break;
        case "thread":
          endpoint = `/api/threads/${report.targetId}`;
          break;
        case "user":
          endpoint = `/api/users/${report.targetId}`;
          break;
        default:
          return;
      }
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await axios.delete("/api/reports", {
        data: { type: report.type, targetId: report.targetId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchReports();
    } catch (err) {
      alert("Failed to delete content or report.");
    }
  };

  const handleIgnore = async (report) => {
    try {
      await axios.delete("/api/reports", {
        data: { type: report.type, targetId: report.targetId },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchReports();
    } catch (err) {
      alert("Failed to ignore report.");
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading reports...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "2rem", background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      <h2 style={{ marginBottom: "2rem" }}>All Reports</h2>
      {reports.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888" }}>No reports found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Reporter</th>
              <th style={thStyle}>Actions</th>
              <th style={thStyle}>Content</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{r.type}</td>
                <td style={tdStyle}>{r.reason || <span style={{ color: "#aaa" }}>—</span>}</td>
                <td style={tdStyle}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{r.reporter?.name || "Unknown"}</div>
                    {r.reporter?.email && (
                      <div style={{ color: "#888", fontSize: "0.92em", marginTop: 2 }}>
                        {r.reporter.email}
                      </div>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  <button
                    style={{
                      ...actionBtnStyle,
                      background: "#007bff",
                      margin: 0,
                      padding: "0.3rem 0.7rem",
                      fontSize: "0.95rem"
                    }}
                    onClick={() => window.open(r.url, "_blank")}
                    disabled={!r.url}
                  >
                    Go To
                  </button>
                </td>
                <td style={tdStyle}>
                  <button
                    style={actionBtnStyle}
                    onClick={() => handleDeleteContent(r)}
                  >
                    Delete
                  </button>
                  <button
                    style={{ ...actionBtnStyle, background: "#bbb", marginLeft: 8 }}
                    onClick={() => handleIgnore(r)}
                  >
                    Ignore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  fontWeight: 600,
  color: "#2c3e50",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "0.75rem",
  verticalAlign: "top",
  fontSize: "1rem",
};

const actionBtnStyle = {
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "0.4rem 0.9rem",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "0.97rem",
};