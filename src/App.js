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
  const [darkMode, setDarkMode] = useState(true); // default dark mode

  const claimId = `CLM-${Date.now()}`;

  /* ---------------- Fraud Score Animation ---------------- */
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
    }
  }, [result]);

  /* ---------------- Helper Functions ---------------- */
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

  /* ---------------- File Handling ---------------- */
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
      const response = await fetch("http://127.0.0.1:8000/api/audit", {
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

  /* ---------------- Download Report ---------------- */
  const downloadReport = () => {
    if (!result) return;
    setDownloading(true);

    const htmlContent = `
      <html>
      <head>
        <title>Audit Report - ${claimId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: ${
            darkMode ? "#111" : "#f9f9f9"
          }; color: ${darkMode ? "#fff" : "#111"}; }
          h1,h2,h3 { color: ${darkMode ? "#00ff9c" : "#2d3436"}; }
          .meta { font-size:14px; color:${darkMode ? "#aaa" : "#555"}; margin-bottom:20px; }
          .stats { display:flex; flex-wrap:wrap; gap:20px; margin-bottom:30px; }
          .statBox { flex:1 1 180px; background:${
            darkMode ? "rgba(255,255,255,0.05)" : "#fff"
          }; padding:15px; border-radius:8px; text-align:center; ${
      darkMode ? "" : "box-shadow:0 3px 10px rgba(0,0,0,0.1);"
    }}
          ul { padding-left:20px; }
          pre { background:${darkMode ? "rgba(255,255,255,0.05)" : "#f1f3f6"}; padding:10px; border-radius:6px; overflow-x:auto; }
          .green { color:#00ff9c; font-weight:bold; }
          .yellow { color:#ffea00; font-weight:bold; }
          .red { color:#ff3d00; font-weight:bold; }
        </style>
      </head>
      <body>
        <h1>ClaimPilot AI Audit Report</h1>
        <p class="meta">Claim ID: <strong>${claimId}</strong><br/>Date: ${new Date().toLocaleString()}</p>
        <div class="stats">
          <div class="statBox"><h3>Total Estimate</h3><p>PKR ${result.total_estimate_pkr}</p></div>
          <div class="statBox"><h3>Fraud Score</h3>
            <p class="${
              result.fraud_confidence_score <= 50
                ? "green"
                : result.fraud_confidence_score <= 80
                ? "yellow"
                : "red"
            }">${result.fraud_confidence_score}%</p>
          </div>
          <div class="statBox"><h3>Verdict</h3>
            <p class="${
              result.verdict.toLowerCase() === "fraud"
                ? "red"
                : result.verdict.toLowerCase() === "suspicious"
                ? "yellow"
                : "green"
            }">${result.verdict}</p>
          </div>
          <div class="statBox"><h3>Damaged Parts</h3><p>${result.damaged_parts?.length || 0}</p></div>
        </div>
        <h2>Fraud Analysis</h2><p>${result.fraud_analysis || "No fraud detected."}</p>
        <h2>Damaged Parts</h2>${
          result.damaged_parts?.length
            ? `<ul>${result.damaged_parts.map((p) => `<li>${p}</li>`).join("")}</ul>`
            : "<p>No parts detected.</p>"
        }
        <h2>Itemized Costs</h2>
        <pre>${JSON.stringify(result.itemized_costs, null, 2)}</pre>
        <h2>AI Confidence Explanation</h2>
        <p>Score calculated using anomaly detection, metadata consistency checks, and cost deviation models.</p>
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

  /* ---------------- Theme Styles ---------------- */
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
    buttonRow: { display: "flex", gap: 15, justifyContent: "center", flexWrap: "wrap" },
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
      transition: "0.3s transform",
      cursor: "default",
    },
    gauge: { width: 90, height: 90 },
    gaugeText: { fontSize: 10, fontWeight: 700, fill: "#fff", textAnchor: "middle" },
    progressBar: { height: 14, background: "#111", borderRadius: 12, overflow: "hidden", marginBottom: 20 },
    progressFill: { height: "100%", background: "linear-gradient(90deg,#00ff9c,#ffea00,#ff3d00)", transition: "width 1s ease" },
    partItem: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" },
    severity: { background: "#ff3d0033", color: "#ff3d00", padding: "3px 10px", borderRadius: 8, fontWeight: 600 },
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

  const lightTheme = {
    page: {
      minHeight: "100vh",
      background: "#f9f9f9",
      fontFamily: "Poppins, sans-serif",
      padding: 30,
      color: "#111",
    },
    container: { maxWidth: 1000, margin: "auto" },
    header: { textAlign: "center", marginBottom: 50 },
    logo: { fontSize: 42, fontWeight: 800, color: "#2d3436" },
    tagline: { marginTop: 10, color: "#636e72", fontSize: 16 },
    uploadCard: {
      background: "#fff",
      padding: 35,
      borderRadius: 15,
      border: "1px solid #e0e0e0",
      boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
      marginBottom: 40,
    },
    uploadLabel: {
      display: "block",
      border: "2px dashed #0984e3",
      padding: 30,
      borderRadius: 12,
      textAlign: "center",
      fontWeight: 600,
      cursor: "pointer",
      marginBottom: 25,
      color: "#2d3436",
      transition: "0.3s all",
    },
    preview: {
      width: "100%",
      maxHeight: 320,
      borderRadius: 15,
      marginBottom: 15,
      cursor: "zoom-in",
      objectFit: "cover",
      boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    },
    previewZoom: {
      width: "100%",
      maxHeight: 600,
      borderRadius: 15,
      marginBottom: 15,
      cursor: "zoom-out",
      objectFit: "contain",
      boxShadow: "0 0 25px rgba(0,0,0,0.15)",
    },
    buttonRow: { display: "flex", gap: 15, justifyContent: "center", flexWrap: "wrap" },
    primaryBtn: {
      padding: "14px 32px",
      background: "#0984e3",
      borderRadius: 12,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      boxShadow: "0 5px 15px rgba(9,132,227,0.4)",
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
      boxShadow: "0 5px 15px rgba(214,48,49,0.4)",
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
      borderRadius: 15,
      padding: 35,
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
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
      boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
      cursor: "default",
      transition: "0.3s transform",
    },
    gauge: { width: 90, height: 90 },
    gaugeText: { fontSize: 10, fontWeight: 700, fill: "#2d3436", textAnchor: "middle" },
    progressBar: { height: 14, background: "#dfe6e9", borderRadius: 12, overflow: "hidden", marginBottom: 20 },
    progressFill: { height: "100%", background: "linear-gradient(90deg,#00b894,#fdcb6e,#d63031)", transition: "width 1s ease" },
    partItem: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e0e0e0" },
    severity: { background: "#ffe6e6", color: "#d63031", padding: "3px 10px", borderRadius: 8, fontWeight: 600 },
    pre: { background: "#f1f3f6", padding: 20, borderRadius: 12, overflowX: "auto", color: "#2d3436" },
    downloadBtn: {
      marginTop: 25,
      padding: "14px 32px",
      background: "#0984e3",
      border: "none",
      borderRadius: 12,
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      boxShadow: "0 5px 15px rgba(9,132,227,0.4)",
      transition: "0.3s all",
    },
    error: { color: "#d63031", marginTop: 10 },
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <div style={theme.page}>
      <div style={theme.container}>
        <header style={theme.header}>
          <h1 style={theme.logo}>ClaimPilot AI</h1>
          <p style={theme.tagline}>Intelligent Vehicle Damage Assessment & Fraud Detection</p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              marginTop: 10,
              padding: "8px 20px",
              cursor: "pointer",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              background: darkMode ? "#fff" : "#2d3436",
              color: darkMode ? "#111" : "#fff",
            }}
          >
            Switch to {darkMode ? "Light" : "Dark"} Mode
          </button>
        </header>

        {/* Upload Card */}
        <div
          style={theme.uploadCard}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleFileChange({ target: { files: [e.dataTransfer.files[0]] } })}
        >
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

        {/* Result Section */}
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
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path stroke={gaugeColor(animatedScore)} strokeDasharray={`${animatedScore}, 100`} fill="none"
                    strokeWidth="3" style={{ transition: "stroke-dasharray 1s ease" }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <text x="18" y="20.5" style={theme.gaugeText}>{animatedScore}%</text>
                </svg>
                <p style={{ color: gaugeColor(animatedScore), fontWeight: 600 }}>{riskLevel(animatedScore)}</p>
              </div>

              <div style={{...theme.statBox, color: verdictColor(result.verdict)}}><p>Verdict</p><h3>{result.verdict}</h3></div>
              <div style={theme.statBox}><p>Damaged Parts</p><h3>{result.damaged_parts?.length || 0}</h3></div>
            </div>

            <div style={theme.progressBar}>
              <div style={{ ...theme.progressFill, width: `${animatedScore}%` }} />
            </div>

            <div style={theme.details}>
              <h3>Fraud Analysis</h3>
              <p>{result.fraud_analysis || "No fraud detected."}</p>

              <h3>Damaged Parts</h3>
              {result.damaged_parts?.length ? (
                <ul>{result.damaged_parts.map((p,i)=><li key={i} style={theme.partItem}>{p}<span style={theme.severity}>Moderate</span></li>)}</ul>
              ) : <p>No parts detected.</p>}

              <h3>Itemized Costs</h3>
              <pre style={theme.pre}>{JSON.stringify(result.itemized_costs,null,2)}</pre>

              <h3>AI Confidence Explanation</h3>
              <p>Score is calculated using anomaly detection, metadata consistency checks, and cost deviation models.</p>

              <button style={theme.downloadBtn} onClick={downloadReport}>
                {downloading ? "Preparing Report..." : "Download Audit Report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
