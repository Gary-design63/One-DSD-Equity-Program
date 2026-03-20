/* ============================================================
   One DSD Equity Program — Agentic Layer v2.0
   8 specialized agents + Sniff Check Protocol (L1–L3)
   Standing Priority Flags integrated into every L2 check.
   ============================================================ */
(function () {
  "use strict";

  /* ── Sniff Check Protocol ──────────────────────────────────── */
  const SNIFF = {

    /* L1: Ingestion Gate — document completeness before any agent processes it */
    L1: function (doc) {
      const failures = [];
      if (!doc.title || doc.title.trim().length < 3)         failures.push("Title missing or too short");
      if (!doc.authorityRank)                                 failures.push("Authority rank not set");
      if (!doc.effectiveDate)                                 failures.push("Effective date missing");
      if (!doc.reviewDate)                                    failures.push("Review date missing");
      if (!doc.owner)                                         failures.push("Document owner not assigned");
      if (!doc.purpose || doc.purpose.trim().length < 20)    failures.push("Purpose is blank or insufficient");
      if (!doc.dataClassification)                           failures.push("Data classification not set");
      return { pass: failures.length === 0, failures };
    },

    /* L2: Pre-Execution — universal + domain-specific checks before agent acts */
    L2: function (entity, context) {
      const D      = window.APP_DATA;
      const spfs   = (D.standingPriorityFlags || []).filter(f => f.status === "Active");
      const alerts = [];

      /* Universal checks */
      if (!entity.owner)
        alerts.push({ level: "High",   msg: "No owner assigned — cannot proceed without accountability" });
      if (!entity.status)
        alerts.push({ level: "Medium", msg: "Status field missing — entity state is undefined" });

      /* Standing Priority Flag checks */
      spfs.forEach(spf => {
        const text = JSON.stringify(entity).toLowerCase();
        const populationMentioned = text.includes(spf.population.toLowerCase().split(" ")[0].toLowerCase());
        if (context === "equity_analysis" && !populationMentioned) {
          alerts.push({
            level: "High",
            msg:   `SPF CHECK: ${spf.population} — this population must be explicitly addressed in every equity analysis (SPF: ${spf.id})`,
            spfId: spf.id
          });
        }
        if (spf.noAggregation && context === "data_reporting") {
          alerts.push({
            level: "Critical",
            msg:   `SPF CHECK: ${spf.population} — disaggregated reporting required; do not aggregate with broader population groups (SPF: ${spf.id})`,
            spfId: spf.id
          });
        }
      });

      /* Escalation rule checks (for workflow runs) */
      if (entity.workflowId && entity.startDate) {
        const wf       = (D.workflows || []).find(w => w.id === entity.workflowId);
        const daysOpen = Math.floor((Date.now() - new Date(entity.startDate).getTime()) / 86400000);
        (wf?.escalationRules || []).forEach(rule => {
          if (rule.trigger.startsWith("daysOpen >")) {
            const threshold = parseInt(rule.trigger.split(">")[1].trim(), 10);
            if (daysOpen > threshold) {
              alerts.push({ level: rule.level, msg: `ESCALATION: ${rule.action} (${daysOpen} days open; threshold: ${threshold})` });
            }
          }
        });
      }

      return { pass: alerts.filter(a => a.level === "Critical").length === 0, alerts };
    },

    /* L3: Output Validation — before any result is surfaced or stored */
    L3: function (output) {
      const failures = [];
      if (!output)                                          failures.push("Output is null or undefined");
      if (output && typeof output !== "object")            failures.push("Output must be a structured object");
      if (output && !output.agentId)                       failures.push("Output missing agentId — cannot audit");
      if (output && !output.generatedAt)                   failures.push("Output missing timestamp");
      if (output && !Array.isArray(output.insights))       failures.push("Output.insights must be an array");
      if (output && !Array.isArray(output.alerts))         failures.push("Output.alerts must be an array");
      if (output && !Array.isArray(output.recommendations))failures.push("Output.recommendations must be an array");
      return { pass: failures.length === 0, failures };
    }
  };

  /* ── Agent Factory ─────────────────────────────────────────── */
  function makeOutput(agentId, insights, alerts, recommendations) {
    const output = { agentId, generatedAt: new Date().toISOString(), insights, alerts, recommendations };
    const l3 = SNIFF.L3(output);
    if (!l3.pass) console.warn("[AGENT L3 FAIL]", agentId, l3.failures);
    return output;
  }

  /* ── Agent 1: KPI Monitor ──────────────────────────────────── */
  const kpiMonitor = {
    id: "AGT-001", name: "KPI Monitor", domain: "measurement", autonomyLevel: "high",
    run: function () {
      const D = window.APP_DATA;
      const insights = [], alerts = [], recs = [];
      D.kpis.forEach(k => {
        if (k.currentValue === null || k.currentValue === undefined) {
          alerts.push({ level: "Medium", kpiId: k.id, msg: `${k.name}: No current value recorded` });
          return;
        }
        const pct = k.target ? k.currentValue / k.target : null;
        if (pct !== null && pct < 0.5)
          alerts.push({ level: "High",   kpiId: k.id, msg: `${k.name} is at ${Math.round(pct*100)}% of target — requires immediate action` });
        else if (pct !== null && pct < 0.8)
          alerts.push({ level: "Medium", kpiId: k.id, msg: `${k.name} is at ${Math.round(pct*100)}% of target — trending below goal` });
        if (k.trend === "down" && k.dashboardGroup === "Quality & Follow-Through")
          alerts.push({ level: "High",   kpiId: k.id, msg: `${k.name} quality metric declining — investigate root cause` });
      });
      const atRisk = D.kpis.filter(k => k.target && k.currentValue !== null && (k.currentValue / k.target) < 0.8);
      if (atRisk.length === 0) insights.push("All measured KPIs are at or above 80% of target");
      else recs.push(`Review ${atRisk.map(k => k.name).join(", ")} — each is below 80% of target`);
      if (!D.kpis.find(k => k.id === "KPI-013")?.currentValue)
        recs.push("KPI-013 (Output Multiplier Index) has no baseline — establish baseline this quarter");
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 2: Policy Review ────────────────────────────────── */
  const policyReview = {
    id: "AGT-002", name: "Policy Review", domain: "governance", autonomyLevel: "medium",
    run: function () {
      const D = window.APP_DATA;
      const today = new Date(); const insights = [], alerts = [], recs = [];
      D.documents.forEach(doc => {
        if (!doc.reviewDate) return;
        const reviewDate = new Date(doc.reviewDate);
        const daysUntil  = Math.floor((reviewDate - today) / 86400000);
        if (daysUntil < 0)
          alerts.push({ level: "High",   docId: doc.id, msg: `"${doc.shortTitle || doc.title}" review is OVERDUE by ${Math.abs(daysUntil)} days` });
        else if (daysUntil <= 60)
          alerts.push({ level: "Medium", docId: doc.id, msg: `"${doc.shortTitle || doc.title}" is due for review in ${daysUntil} days` });
        const l1 = SNIFF.L1(doc);
        if (!l1.pass)
          alerts.push({ level: "Medium", docId: doc.id, msg: `Document integrity issues: ${l1.failures.join("; ")}` });
      });
      const overdue = D.documents.filter(d => d.reviewDate && new Date(d.reviewDate) < today);
      if (overdue.length === 0) insights.push("All documents are within their review schedules");
      else recs.push(`Schedule review for ${overdue.length} overdue document(s): ${overdue.map(d => d.shortTitle || d.id).join(", ")}`);
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 3: Document Standards ──────────────────────────── */
  const documentStandards = {
    id: "AGT-003", name: "Document Standards", domain: "quality", autonomyLevel: "medium",
    run: function () {
      const D = window.APP_DATA; const insights = [], alerts = [], recs = [];
      let passCount = 0;
      D.documents.forEach(doc => {
        const l1 = SNIFF.L1(doc);
        if (l1.pass) { passCount++; }
        else { alerts.push({ level: "Medium", docId: doc.id, msg: `L1 gate failures for "${doc.shortTitle || doc.title}": ${l1.failures.join("; ")}` }); }
      });
      insights.push(`${passCount}/${D.documents.length} documents pass L1 ingestion gate`);
      const noSoT = D.documents.filter(d => !d.sourceOfTruth && d.authorityRank <= 3);
      if (noSoT.length) recs.push(`${noSoT.length} high-authority document(s) not marked as Source of Truth — review and certify`);
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 4: Consultation Router ──────────────────────────── */
  const consultationRouter = {
    id: "AGT-004", name: "Consultation Router", domain: "operations", autonomyLevel: "high",
    run: function () {
      const D = window.APP_DATA; const insights = [], alerts = [], recs = [];
      const activeRuns = D.workflowRuns.filter(r => r.status === "In Progress");
      const highPriority = activeRuns.filter(r => r.priority === "High");
      highPriority.forEach(run => {
        const l2 = SNIFF.L2(run, "workflow_run");
        l2.alerts.forEach(a => alerts.push({ level: a.level, runId: run.id, msg: a.msg }));
      });
      const intake = activeRuns.filter(r => r.workflowId === "WF-001");
      if (intake.length > 3) alerts.push({ level: "Medium", msg: `${intake.length} consultation requests in intake — triage queue is growing` });
      insights.push(`${activeRuns.length} active workflow runs; ${highPriority.length} high priority`);
      if (highPriority.length > 2) recs.push("High-priority run volume exceeds normal capacity — consider deferring lower-priority requests");
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 5: Equity Learning ───────────────────────────────── */
  const equityLearning = {
    id: "AGT-005", name: "Equity Learning", domain: "education", autonomyLevel: "high",
    run: function () {
      const D = window.APP_DATA; const insights = [], alerts = [], recs = [];
      const completionKPI = D.kpis.find(k => k.id === "KPI-010");
      if (completionKPI) {
        const pct = completionKPI.currentValue;
        if (pct < 70)
          alerts.push({ level: "High",   msg: `Staff completion rate is ${pct}% — critically below 80% target` });
        else if (pct < 80)
          alerts.push({ level: "Medium", msg: `Staff completion rate is ${pct}% — below 80% target` });
        else insights.push(`Staff educational completion is on track at ${pct}%`);
      }
      const inDev = D.learningAssets.filter(a => a.status === "In Development");
      if (inDev.length) recs.push(`${inDev.length} learning asset(s) in development: ${inDev.map(a => a.title).join(", ")} — complete accessibility check before deployment`);
      // SPF check on learning assets
      const D2 = window.APP_DATA;
      const spfs = (D2.standingPriorityFlags || []).filter(f => f.status === "Active");
      spfs.forEach(spf => {
        const covered = D.learningAssets.some(a => JSON.stringify(a).toLowerCase().includes(spf.population.split(" ")[0].toLowerCase()));
        if (!covered) recs.push(`No learning asset explicitly addresses ${spf.population} (${spf.id}) — gap in educational coverage`);
      });
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 6: Community Intelligence ───────────────────────── */
  const communityIntelligence = {
    id: "AGT-006", name: "Community Intelligence", domain: "engagement", autonomyLevel: "high",
    run: function () {
      const D = window.APP_DATA; const insights = [], alerts = [], recs = [];
      const engagementRuns = D.workflowRuns.filter(r => r.workflowId === "WF-005");
      const spfs = (D.standingPriorityFlags || []).filter(f => f.status === "Active");
      if (engagementRuns.length === 0) {
        alerts.push({ level: "Medium", msg: "No active community engagement workflow runs — check if analysis demand requires engagement" });
      }
      spfs.forEach(spf => {
        const addressed = engagementRuns.some(r =>
          JSON.stringify(r).toLowerCase().includes(spf.population.split(" ")[0].toLowerCase())
        );
        if (!addressed) recs.push(`Community engagement plan should explicitly include ${spf.population} outreach (${spf.id})`);
      });
      const engRisk = D.risks.find(r => r.id === "RISK-005");
      if (engRisk && engRisk.status === "Active")
        alerts.push({ level: "Medium", msg: "RISK-005 active: Community engagement capacity may be insufficient for analysis demand" });
      insights.push(`${engagementRuns.length} community engagement run(s) active`);
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 7: Institutional Memory ─────────────────────────── */
  const institutionalMemory = {
    id: "AGT-007", name: "Institutional Memory", domain: "knowledge", autonomyLevel: "high",
    run: function () {
      const D = window.APP_DATA; const insights = [], alerts = [], recs = [];
      const completed = D.workflowRuns.filter(r => r.status === "Completed");
      insights.push(`${completed.length} completed workflow runs in institutional record`);
      const logs = D.decisionLogs || [];
      insights.push(`${logs.length} decision log entries recorded`);
      if (logs.length === 0) recs.push("No decision logs yet — every stage advancement and AI-assisted output approval should create a decision log entry");
      // Check for orphaned relationships
      const orphaned = D.relationships.filter(rel => {
        const fromExists = [
          ...D.documents, ...D.workflows, ...D.templates,
          ...D.kpis, ...D.learningAssets, ...D.roles
        ].some(e => e.id === rel.fromId);
        return !fromExists;
      });
      if (orphaned.length) alerts.push({ level: "Low", msg: `${orphaned.length} relationship(s) reference entities that no longer exist — run data cleanup` });
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Agent 8: Engagement & Culture ─────────────────────────── */
  const engagementCulture = {
    id: "AGT-008", name: "Engagement & Culture", domain: "culture", autonomyLevel: "high",
    run: function () {
      const D = window.APP_DATA; const insights = [], alerts = [], recs = [];
      const adaRisk = D.risks.find(r => r.id === "RISK-001");
      if (adaRisk && adaRisk.status === "Active") {
        const adaAction = D.actions.find(a => a.id === "ACT-002");
        if (adaAction && adaAction.status === "At Risk")
          alerts.push({ level: "Critical", msg: "ADA Title II deadline at risk AND remediation action is At Risk — escalate to ADSA Director immediately" });
        else
          alerts.push({ level: "High", msg: "ADA Title II compliance deadline risk is Active — monitor weekly" });
      }
      const staffingRisk = D.risks.find(r => r.id === "RISK-002");
      if (staffingRisk && staffingRisk.status === "Active")
        alerts.push({ level: "High", msg: "Single-point-of-failure staffing risk is Active — cross-training action item must remain prioritized" });
      const spfs = (D.standingPriorityFlags || []).filter(f => f.status === "Active");
      spfs.forEach(spf => {
        const inActions = D.actions.some(a => JSON.stringify(a).toLowerCase().includes(spf.population.split(" ")[0].toLowerCase()));
        if (!inActions) recs.push(`No active program action directly addresses ${spf.population} — review program action alignment with ${spf.id}`);
      });
      insights.push(`${spfs.length} Standing Priority Flag(s) active and embedded in all agent checks`);
      return makeOutput(this.id, insights, alerts, recs);
    }
  };

  /* ── Run all agents & aggregate ────────────────────────────── */
  const ALL_AGENTS = [
    kpiMonitor, policyReview, documentStandards, consultationRouter,
    equityLearning, communityIntelligence, institutionalMemory, engagementCulture
  ];

  function runAll() {
    const results = ALL_AGENTS.map(agent => {
      try {
        const output = agent.run();
        // Record to agentActivity log
        (window.APP_DATA.agentActivity = window.APP_DATA.agentActivity || []).push({
          agentId: agent.id, agentName: agent.name, ranAt: output.generatedAt,
          alertCount: output.alerts.length, insightCount: output.insights.length
        });
        return output;
      } catch (e) {
        console.error("[AGENT ERROR]", agent.id, e);
        return makeOutput(agent.id, [], [{ level: "High", msg: `Agent ${agent.name} encountered an error: ${e.message}` }], []);
      }
    });
    return results;
  }

  function runById(agentId) {
    const agent = ALL_AGENTS.find(a => a.id === agentId);
    if (!agent) return null;
    return agent.run();
  }

  /* ── Summary for Dashboard ──────────────────────────────────── */
  function getDashboardSummary() {
    const results  = runAll();
    const critical = [], high = [], medium = [], insights = [], recs = [];
    results.forEach(r => {
      r.alerts.forEach(a => {
        if (a.level === "Critical") critical.push({ ...a, agentId: r.agentId });
        else if (a.level === "High")     high.push({ ...a, agentId: r.agentId });
        else                             medium.push({ ...a, agentId: r.agentId });
      });
      r.insights.forEach(i => insights.push({ text: i, agentId: r.agentId }));
      r.recommendations.forEach(rec => recs.push({ text: rec, agentId: r.agentId }));
    });
    return { critical, high, medium, insights, recommendations: recs, agentCount: ALL_AGENTS.length };
  }

  /* ── Sniff check convenience for L2 equity analysis context ── */
  function checkEquityAnalysis(entity) {
    return SNIFF.L2(entity, "equity_analysis");
  }

  /* ── Public API ────────────────────────────────────────────── */
  window.AGENTS = {
    runAll,
    runById,
    getDashboardSummary,
    checkEquityAnalysis,
    sniff: SNIFF,
    agents: ALL_AGENTS
  };
})();
