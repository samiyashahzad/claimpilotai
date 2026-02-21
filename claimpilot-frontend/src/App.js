import { useState, useEffect } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // light mode default

  const claimId = `CLM-${Date.now()}`;

  useEffect(() => {
    if (result) {
      let start = 0;
      const end = result.fraud_confidence_score || 0;
      const duration = 1200;
      const stepTime = 20;
      const step = (end - start) / (duration / stepTime);

      const interval = setInterval(() => {
        start += step;
        if (start >= end) {
          start = end;
          clearInterval(interval);
        }
        setAnimatedScore(Math.round(start));
      }, stepTime);

      return () => clearInterval(interval);
    }
  }, [result]);

  const riskLevel = (score) => {
    if (score <= 40) return "Low Risk";
    if (score <= 75) return "Medium Risk";
    return "High Risk";
  };

  const gaugeColor = (score) =>
    score <= 50 ? "#00ff9c" : score <= 80 ? "#ffea00" : "#ff3d00";

  const verdictColor = (verdict) => {
    if (!verdict) return "#aaa";
    if (verdict.toLowerCase() === "fraud") return "#ff3d00";
    if (verdict.toLowerCase() === "suspicious") return "#ffea00";
    return "#00ff9c";
  };

  const handleFileChange = (e) => {
    setError(null);
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setAnimatedScore(0);
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select an image first.");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://sofiajeon-claimpilot.hf.space/api/audit", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong!");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setZoom(false);
    setAnimatedScore(0);
    setDownloading(false);
  };

  const downloadReport = () => {
    if (!result) return;
    setDownloading(true);

    const htmlContent = `
      <html>
      <head>
        <title>ClaimPilot AI Audit Report</title>
        <style>
          body { font-family: Arial; padding:20px; }
          h1 { color:#333; }
          table { width:100%; border-collapse:collapse; margin-top:15px; }
          td, th { border:1px solid #ccc; padding:8px; }
        </style>
      </head>
      <body>
        <h1>ClaimPilot AI Audit Report</h1>
        <p><strong>Claim ID:</strong> ${claimId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

        <h2>Summary</h2>
        <p><strong>Total Estimate:</strong> PKR ${result.total_estimate_pkr}</p>
        <p><strong>Fraud Score:</strong> ${animatedScore}%</p>
        <p><strong>Verdict:</strong> ${result.verdict}</p>

        <h2>Fraud Analysis</h2>
        <p>${result.fraud_analysis || "No fraud detected."}</p>

        <h2>Damaged Parts</h2>
        <ul>
          ${result.damaged_parts?.map(p => `<li>${p}</li>`).join("") || "<li>No parts detected</li>"}
        </ul>

        <h2>Itemized Costs</h2>
        <table>
          <tr><th>Part</th><th>Cost (PKR)</th></tr>
          ${
            result.itemized_costs && typeof result.itemized_costs === "object"
              ? Object.entries(result.itemized_costs)
                  .map(([part, cost]) => `<tr><td>${part}</td><td>${cost}</td></tr>`)
                  .join("")
              : "<tr><td colspan='2'>No data</td></tr>"
          }
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_report_${claimId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(false), 800);
  };

  /* DARK THEME */
  const darkTheme = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      fontFamily: "Poppins, sans-serif",
      padding: 30,
      color: "#fff",
    },
    container: { maxWidth: 1000, margin: "auto" },
    header: { textAlign: "center", marginBottom: 50 },
    logo: {
      fontSize: 42,
      fontWeight: 800,
      background: "linear-gradient(90deg,#00ff9c,#00f0ff)",
      WebkitBackgroundClip: "text",
      color: "transparent",
    },
    tagline: { marginTop: 10, color: "#aaa", fontSize: 16 },

    uploadCard: {
      background: "rgba(255,255,255,0.05)",
      padding: 35,
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      marginBottom: 40,
    },
    uploadLabel: {
      display: "block",
      border: "2px dashed #00ff9c",
      padding: 30,
      borderRadius: 15,
      textAlign: "center",
      fontWeight: 600,
      cursor: "pointer",
      marginBottom: 25,
      transition: "0.3s all",
      color: "#fff",
    },

    preview: {
      width: "100%",
      maxHeight: 320,
      borderRadius: 15,
      marginBottom: 15,
      cursor: "zoom-in",
      objectFit: "cover",
      boxShadow: "0 0 25px rgba(0,255,156,0.4)",
    },
    previewZoom: {
      width: "100%",
      maxHeight: 600,
      borderRadius: 15,
      marginBottom: 15,
      cursor: "zoom-out",
      objectFit: "contain",
      boxShadow: "0 0 35px rgba(0,255,156,0.6)",
    },

    buttonRow: {
      display: "flex",
      gap: 15,
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: 15,
    },

    primaryBtn: {
      padding: "14px 32px",
      background: "linear-gradient(90deg,#00ff9c,#00f0ff)",
      borderRadius: 12,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      color: "#000",
      boxShadow: "0 5px 20px rgba(0,255,156,0.5)",
      transition: "0.3s all",
    },
    resetBtn: {
      padding: "14px 32px",
      background: "#ff3d00",
      borderRadius: 12,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      boxShadow: "0 5px 20px rgba(255,61,0,0.5)",
      transition: "0.3s all",
    },
    disabledBtn: {
      padding: "14px 32px",
      background: "#555",
      borderRadius: 12,
      border: "none",
      color: "#ccc",
    },

    resultCard: {
      background: "rgba(255,255,255,0.05)",
      borderRadius: 20,
      padding: 35,
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      backdropFilter: "blur(15px)",
      marginTop: 20,
    },
    meta: { fontSize: 13, color: "#aaa" },

    stats: { display: "flex", flexWrap: "wrap", gap: 20, margin: "30px 0" },
    statBox: {
      flex: "1 1 180px",
      padding: 20,
      borderRadius: 15,
      background: "rgba(255,255,255,0.05)",
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,255,156,0.2)",
    },

    gauge: { width: 90, height: 90 },
    gaugeText: { fontSize: 10, fontWeight: 700, fill: "#fff", textAnchor: "middle" },
    progressBar: { height: 14, background: "#111", borderRadius: 12, overflow: "hidden", marginBottom: 20 },
    progressFill: { height: "100%", background: "linear-gradient(90deg,#00ff9c,#ffea00,#ff3d00)", transition: "width 1s ease" },

    itemTable: { width: "100%", borderCollapse: "collapse", marginTop: 20 },
    itemRow: { borderBottom: "1px solid rgba(255,255,255,0.1)" },
    itemCell: { padding: "12px 0" },
    severity: { background: "#ff3d0033", color: "#ff3d00", padding: "3px 10px", borderRadius: 8 },

    pre: { background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 12, overflowX: "auto", color: "#fff" },
    downloadBtn: {
      marginTop: 25,
      padding: "14px 32px",
      background: "linear-gradient(90deg,#00ff9c,#00f0ff)",
      border: "none",
      borderRadius: 12,
      fontWeight: 700,
      cursor: "pointer",
      color: "#000",
      boxShadow: "0 5px 20px rgba(0,255,156,0.5)",
      transition: "0.3s all",
    },
    error: { color: "#ff3d00", marginTop: 10 },
  };

  /* LIGHT THEME (modern & balanced) */
  const lightTheme = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fa",
      fontFamily: "Poppins, sans-serif",
      padding: 30,
      color: "#111",
    },
    container: { maxWidth: 1000, margin: "auto" },
    header: { textAlign: "center", marginBottom: 40 },
    logo: { fontSize: 42, fontWeight: 800, color: "#2d3436" },
    tagline: { marginTop: 10, color: "#636e72", fontSize: 16 },

    uploadCard: {
      background: "#fff",
      padding: 35,
      borderRadius: 18,
      border: "1px solid #e3e6eb",
      boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
      marginBottom: 40,
    },
    uploadLabel: {
      display: "block",
      border: "2px dashed #0984e3",
      padding: 28,
      borderRadius: 12,
      textAlign: "center",
      fontWeight: 600,
      cursor: "pointer",
      transition: "0.3s all",
      color: "#2d3436",
    },

    preview: {
      width: "100%",
      maxHeight: 320,
      borderRadius: 15,
      marginBottom: 15,
      cursor: "zoom-in",
      objectFit: "cover",
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    },
    previewZoom: {
      width: "100%",
      maxHeight: 600,
      borderRadius: 15,
      marginBottom: 15,
      cursor: "zoom-out",
      objectFit: "contain",
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    },

    buttonRow: {
      display: "flex",
      gap: 15,
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: 15,
    },

    primaryBtn: {
      padding: "12px 32px",
      background: "#0984e3",
      borderRadius: 12,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      boxShadow: "0 6px 18px rgba(9,132,227,0.4)",
      transition: "0.3s all",
    },
    resetBtn: {
      padding: "14px 32px",
      background: "#d63031",
      borderRadius: 12,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      boxShadow: "0 6px 18px rgba(214,48,49,0.35)",
      transition: "0.3s all",
    },
    disabledBtn: {
      padding: "14px 32px",
      background: "#b2bec3",
      borderRadius: 12,
      border: "none",
      color: "#636e72",
      cursor: "not-allowed",
    },

    resultCard: {
      background: "#fff",
      borderRadius: 18,
      padding: 35,
      boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
      marginTop: 20,
    },
    meta: { fontSize: 13, color: "#636e72" },

    stats: { display: "flex", flexWrap: "wrap", gap: 20, margin: "30px 0" },
    statBox: {
      flex: "1 1 180px",
      padding: 20,
      borderRadius: 12,
      background: "#f1f3f6",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    },

    gauge: { width: 90, height: 90 },
    gaugeText: { fontSize: 10, fontWeight: 700, fill: "#2d3436", textAnchor: "middle" },
    progressBar: { height: 14, background: "#dfe6e9", borderRadius: 12, overflow: "hidden", marginBottom: 20 },
    progressFill: { height: "100%", background: "linear-gradient(90deg,#00b894,#fdcb6e,#d63031)", transition: "width 1s ease" },

    itemTable: { width: "100%", borderCollapse: "collapse", marginTop: 20 },
    itemRow: { borderBottom: "1px solid #e0e0e0" },
    itemCell: { padding: "12px 0" },
    severity: { background: "#ffe6e6", color: "#d63031", padding: "3px 10px", borderRadius: 8 },

    pre: { background: "#f1f3f6", padding: 20, borderRadius: 12, overflowX: "auto", color: "#2d3436" },
    downloadBtn: {
      marginTop: 25,
      padding: "14px 32px",
      background: "#0984e3",
      border: "none",
      borderRadius: 12,
      color: "#fff",
    },
    error: { color: "#d63031", marginTop: 10 },
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <div style={theme.page}>
      <div style={theme.container}>
        <header style={theme.header}>
          <h1 style={theme.logo}>ClaimPilot AI</h1>
          <p style={theme.tagline}>Intelligent Vehicle Damage & Fraud Detection</p>

          <button onClick={() => setDarkMode(!darkMode)} style={theme.primaryBtn}>
            Switch Mode
          </button>
        </header>

        <div style={theme.uploadCard}>
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={zoom ? theme.previewZoom : theme.preview}
              onClick={() => setZoom(!zoom)}
            />
          )}

          <label style={theme.uploadLabel}>
            {file ? file.name : "Click or Drag Image Here"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </label>

          <div style={theme.buttonRow}>
            <button onClick={handleUpload} disabled={loading} style={loading ? theme.disabledBtn : theme.primaryBtn}>
              {loading ? "Analyzing..." : "Run AI Audit"}
            </button>
            {file && <button onClick={handleReset} style={theme.resetBtn}>Reset</button>}
          </div>

          {error && <p style={theme.error}>{error}</p>}
        </div>

        {result && (
          <div style={theme.resultCard}>
            <h2>Audit Summary</h2>
            <p style={theme.meta}>
              Claim ID: <strong>{claimId}</strong> | {new Date().toLocaleString()}
            </p>

            <div style={theme.stats}>
              <div style={theme.statBox}>
                <p>Total Estimate</p>
                <h3>PKR {result.total_estimate_pkr}</h3>
              </div>

              <div style={theme.statBox}>
                <p>Fraud Score</p>
                <svg viewBox="0 0 36 36" style={theme.gauge}>
                  <path stroke={darkMode ? "#333" : "#dfe6e9"} fill="none" strokeWidth="2.5"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke={gaugeColor(animatedScore)} strokeDasharray={`${animatedScore}, 100`} fill="none"
                    strokeWidth="3"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.5" style={theme.gaugeText}>{animatedScore}%</text>
                </svg>
                <p style={{ color: gaugeColor(animatedScore), fontWeight: 600 }}>{riskLevel(animatedScore)}</p>
              </div>

              <div style={{ ...theme.statBox, color: verdictColor(result.verdict) }}>
                <p>Verdict</p>
                <h3>{result.verdict}</h3>
              </div>

              <div style={theme.statBox}>
                <p>Damaged Parts</p>
                <h3>{result.damaged_parts?.length || 0}</h3>
              </div>
            </div>

            <div style={theme.progressBar}>
              <div style={{ ...theme.progressFill, width: `${animatedScore}%` }} />
            </div>

            <h3>Fraud Analysis</h3>
            <p>{result.fraud_analysis || "No fraud detected."}</p>

            <h3>Damaged Parts</h3>
            {result.damaged_parts?.length ? (
              <ul>{result.damaged_parts.map((p, i) => <li key={i}>{p}</li>)}</ul>
            ) : <p>No parts detected.</p>}

            <h3>Itemized Costs</h3>
            {result.itemized_costs && typeof result.itemized_costs === "object" ? (
              <table style={theme.itemTable}>
                <tbody>
                  {Object.entries(result.itemized_costs).map(([part, cost], index) => (
                    <tr key={index} style={theme.itemRow}>
                      <td style={theme.itemCell}>
                        <strong>{part}</strong>
                        <p style={{ margin: 0, fontSize: 13 }}>Repair / replacement estimate</p>
                      </td>
                      <td style={theme.itemCell} align="right">
                        <span style={theme.severity}>PKR {cost}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No itemized cost data available.</p>
            )}

            <h3>AI Confidence Explanation</h3>
            <p>Score is calculated using anomaly detection and metadata checks.</p>

            <button style={theme.downloadBtn} onClick={downloadReport}>
              {downloading ? "Preparing Report..." : "Download Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;