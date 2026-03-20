/* ============================================================
   One DSD Equity Program — Persistence Store v2.0
   localStorage-backed; falls back to seed data on first load.
   All CRUD operations call STORE.save() after mutating APP_DATA.
   ============================================================ */
(function () {
  "use strict";

  const KEY     = "one_dsd_equity_v2";
  const VERSION = "2.0";

  /* ── Load ─────────────────────────────────────────────────── */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return; // first visit — seed data from data.js is already in APP_DATA
      const saved = JSON.parse(raw);
      if (saved.__version !== VERSION) {
        // Schema version mismatch — clear and use seed data
        localStorage.removeItem(KEY);
        console.info("[STORE] Version mismatch — resetting to seed data.");
        return;
      }
      // Merge every array/object collection from localStorage over APP_DATA
      const collections = [
        "roles","documents","workflows","templates","kpis",
        "workflowRuns","learningAssets","relationships",
        "actions","risks","reportingPeriods",
        "standingPriorityFlags","decisionLogs","agentActivity"
      ];
      collections.forEach(k => {
        if (saved[k] !== undefined) window.APP_DATA[k] = saved[k];
      });
    } catch (e) {
      console.warn("[STORE] Load error — using seed data.", e);
    }
  }

  /* ── Save ─────────────────────────────────────────────────── */
  function save() {
    try {
      const payload = Object.assign({ __version: VERSION }, window.APP_DATA);
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch (e) {
      // Quota exceeded or private browsing — degrade gracefully
      console.warn("[STORE] Save error — changes will not persist.", e);
    }
  }

  /* ── Reset to seed data ────────────────────────────────────── */
  function reset() {
    if (!confirm("Reset all data to defaults? This cannot be undone.")) return;
    localStorage.removeItem(KEY);
    location.reload();
  }

  /* ── Export JSON snapshot ──────────────────────────────────── */
  function exportData() {
    const ts   = new Date().toISOString().slice(0, 10);
    const name = `one-dsd-equity-${ts}.json`;
    const blob = new Blob([JSON.stringify(window.APP_DATA, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Import JSON snapshot ──────────────────────────────────── */
  function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        // Basic validation
        if (!imported.roles || !imported.documents) {
          alert("Invalid data file — missing required collections.");
          return;
        }
        Object.assign(window.APP_DATA, imported);
        save();
        location.reload();
      } catch (err) {
        alert("Could not parse file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ── Public API ────────────────────────────────────────────── */
  window.STORE = { load, save, reset, exportData, importData };
})();
