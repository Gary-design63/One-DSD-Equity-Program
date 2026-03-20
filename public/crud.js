/* ============================================================
   One DSD Equity Program — Generic CRUD Engine v2.0
   Schema-driven: one form builder, one delete handler.
   All mutations call STORE.save() and re-render current route.
   ============================================================ */
(function () {
  "use strict";

  const D = () => window.APP_DATA;

  /* ── ID Generation ─────────────────────────────────────────── */
  function nextId(collection, prefix) {
    const existing = (D()[collection] || []).map(e => e.id).filter(id => id && id.startsWith(prefix + "-"));
    if (!existing.length) return `${prefix}-001`;
    const nums = existing.map(id => parseInt(id.split("-").pop(), 10)).filter(n => !isNaN(n));
    const next  = Math.max(...nums) + 1;
    return `${prefix}-${String(next).padStart(3, "0")}`;
  }

  /* ── Toast ─────────────────────────────────────────────────── */
  function toast(msg, type) {
    const t     = document.createElement("div");
    t.className = `toast toast--${type || "success"}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("toast--visible"));
    setTimeout(() => { t.classList.remove("toast--visible"); setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* ── Modal ─────────────────────────────────────────────────── */
  let _afterClose = null;
  function showModal(title, bodyHTML, footerHTML, afterClose) {
    _afterClose = afterClose || null;
    let overlay = document.getElementById("crud-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "crud-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="modal__header">
          <h2 class="modal__title">${title}</h2>
          <button class="modal__close btn btn--icon" id="modal-close" aria-label="Close">
            <i data-lucide="x" class="icon-sm"></i>
          </button>
        </div>
        <div class="modal__body">${bodyHTML}</div>
        <div class="modal__footer">${footerHTML}</div>
      </div>`;
    overlay.classList.add("modal-overlay--visible");
    document.getElementById("modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", handleEsc);
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
  function handleEsc(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() {
    const overlay = document.getElementById("crud-overlay");
    if (overlay) overlay.classList.remove("modal-overlay--visible");
    document.removeEventListener("keydown", handleEsc);
    if (_afterClose) { _afterClose(); _afterClose = null; }
  }

  /* ── Field Builders ────────────────────────────────────────── */
  function buildField(field, value) {
    const id  = `field-${field.key}`;
    const val = (value !== undefined && value !== null) ? value : (field.default || "");
    const req = field.required ? " required" : "";

    if (field.type === "textarea") {
      return `<div class="form-group">
        <label class="form-label" for="${id}">${field.label}${field.required ? " *" : ""}</label>
        <textarea id="${id}" name="${field.key}" class="form-input form-textarea"${req}>${val}</textarea>
      </div>`;
    }
    if (field.type === "select") {
      const opts = typeof field.options === "function" ? field.options() : (field.options || []);
      const optHTML = opts.map(o => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? (o.label || o.value) : o;
        return `<option value="${v}"${String(val) === String(v) ? " selected" : ""}>${l}</option>`;
      }).join("");
      return `<div class="form-group">
        <label class="form-label" for="${id}">${field.label}${field.required ? " *" : ""}</label>
        <select id="${id}" name="${field.key}" class="form-input form-select"${req}>
          <option value="">— Select —</option>${optHTML}
        </select>
      </div>`;
    }
    if (field.type === "multiselect") {
      const opts    = typeof field.options === "function" ? field.options() : (field.options || []);
      const current = Array.isArray(val) ? val : [];
      const optHTML = opts.map(o => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? (o.label || o.value) : o;
        return `<label class="form-checkbox"><input type="checkbox" name="${field.key}[]" value="${v}"${current.includes(v) ? " checked" : ""}><span>${l}</span></label>`;
      }).join("");
      return `<div class="form-group">
        <label class="form-label">${field.label}</label>
        <div class="form-checkgroup">${optHTML}</div>
      </div>`;
    }
    if (field.type === "number") {
      return `<div class="form-group">
        <label class="form-label" for="${id}">${field.label}${field.required ? " *" : ""}</label>
        <input type="number" id="${id}" name="${field.key}" class="form-input" value="${val}" step="${field.step || "any"}"${req}>
      </div>`;
    }
    return `<div class="form-group">
      <label class="form-label" for="${id}">${field.label}${field.required ? " *" : ""}</label>
      <input type="${field.type || "text"}" id="${id}" name="${field.key}" class="form-input" value="${val}"${req}>
    </div>`;
  }

  function collectForm(form, schema) {
    const result = {};
    schema.fields.forEach(field => {
      if (field.type === "multiselect") {
        result[field.key] = [...form.querySelectorAll(`[name="${field.key}[]"]:checked`)].map(el => el.value);
      } else {
        const el = form.querySelector(`[name="${field.key}"]`);
        if (!el) return;
        const raw = el.value.trim();
        result[field.key] = (field.type === "number" && raw !== "") ? parseFloat(raw) : raw;
      }
    });
    return result;
  }

  function validateForm(data, schema) {
    const errors = [];
    schema.fields.filter(f => f.required).forEach(f => {
      const v = data[f.key];
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0))
        errors.push(`${f.label} is required`);
    });
    return errors;
  }

  /* ── Entity Schemas ────────────────────────────────────────── */
  const SCHEMAS = {

    action: {
      collection: "actions", idPrefix: "ACT", label: "Program Action",
      fields: [
        { key: "title",           label: "Title",           type: "text",        required: true },
        { key: "description",     label: "Description",     type: "textarea"                    },
        { key: "owner",           label: "Owner",           type: "select",      required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "status",          label: "Status",          type: "select",      required: true,
          options: ["On Track","At Risk","Overdue","Completed"] },
        { key: "priority",        label: "Priority",        type: "select",      required: true,
          options: ["High","Medium","Low"] },
        { key: "dueDate",         label: "Due Date",        type: "date"                        },
        { key: "linkedKPIs",      label: "Linked KPIs",     type: "multiselect",
          options: () => D().kpis.map(k => ({ value: k.id, label: k.name })) },
        { key: "linkedWorkflows", label: "Linked Workflows",type: "multiselect",
          options: () => D().workflows.map(w => ({ value: w.id, label: w.name })) }
      ]
    },

    risk: {
      collection: "risks", idPrefix: "RISK", label: "Risk",
      fields: [
        { key: "title",          label: "Title",           type: "text",        required: true },
        { key: "description",    label: "Description",     type: "textarea"                    },
        { key: "severity",       label: "Severity",        type: "select",      required: true,
          options: ["High","Medium","Low"] },
        { key: "likelihood",     label: "Likelihood",      type: "select",      required: true,
          options: ["High","Medium","Low"] },
        { key: "owner",          label: "Owner",           type: "select",      required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "status",         label: "Status",          type: "select",      required: true,
          options: ["Active","Monitoring","Mitigated","Closed"] },
        { key: "mitigationPlan", label: "Mitigation Plan", type: "textarea"                    },
        { key: "linkedKPIs",     label: "Linked KPIs",     type: "multiselect",
          options: () => D().kpis.map(k => ({ value: k.id, label: k.name })) },
        { key: "linkedWorkflows",label: "Linked Workflows",type: "multiselect",
          options: () => D().workflows.map(w => ({ value: w.id, label: w.name })) }
      ]
    },

    document: {
      collection: "documents", idPrefix: "DOC", label: "Document",
      fields: [
        { key: "title",              label: "Title",               type: "text",     required: true },
        { key: "shortTitle",         label: "Short Title",         type: "text"                     },
        { key: "batch",              label: "Batch",               type: "select",   required: true,
          options: ["Governing Authority","Institutional Context","Equity Analysis and Engagement",
                    "Accessibility and Language Access","Workforce Equity","Service System Operations",
                    "Educational and Reusable Resources","One DSD Program Core Internal"] },
        { key: "authorityType",      label: "Authority Type",      type: "select",   required: true,
          options: ["Law / Regulation","Federal Guidance","Statewide Policy","DHS Enterprise Policy",
                    "ADSA / Division Guidance","Program Governance","Operational Procedures","Educational"] },
        { key: "authorityRank",      label: "Authority Rank (1–8)",type: "number",   required: true },
        { key: "sourceType",         label: "Source Type",         type: "select",   required: true,
          options: ["Public","Internal"] },
        { key: "dataClassification", label: "Data Classification", type: "select",   required: true,
          options: ["Public","Internal","Restricted"] },
        { key: "sourceOrg",          label: "Source Organization", type: "text"                     },
        { key: "documentType",       label: "Document Type",       type: "text"                     },
        { key: "format",             label: "Format",              type: "text"                     },
        { key: "audience",           label: "Audience",            type: "text"                     },
        { key: "owner",              label: "Owner",               type: "select",   required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "effectiveDate",      label: "Effective Date",      type: "date"                     },
        { key: "reviewDate",         label: "Review Date",         type: "date",     required: true  },
        { key: "status",             label: "Status",              type: "select",   required: true,
          options: ["Active","Under Review","Archived","Superseded"] },
        { key: "purpose",            label: "Purpose",             type: "textarea", required: true  },
        { key: "notes",              label: "Notes",               type: "textarea"                  }
      ]
    },

    kpi: {
      collection: "kpis", idPrefix: "KPI", label: "KPI",
      fields: [
        { key: "name",           label: "Name",              type: "text",     required: true },
        { key: "dashboardGroup", label: "Dashboard Group",   type: "select",   required: true,
          options: ["Demand & Throughput","Timeliness","Quality & Follow-Through","Learning & Capacity","Accountability & Progress"] },
        { key: "unit",           label: "Unit",              type: "select",   required: true,
          options: ["count","days","percentage","ratio"] },
        { key: "definition",     label: "Definition",        type: "textarea", required: true },
        { key: "target",         label: "Target Value",      type: "number"                   },
        { key: "currentValue",   label: "Current Value",     type: "number"                   },
        { key: "previousValue",  label: "Previous Value",    type: "number"                   },
        { key: "trend",          label: "Trend",             type: "select",
          options: ["up","down","flat"] },
        { key: "dataQuality",    label: "Data Quality",      type: "select",   required: true,
          options: ["High","Medium","Low"] },
        { key: "owner",          label: "Owner",             type: "select",   required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "status",         label: "Status",            type: "select",   required: true,
          options: ["Active","Inactive"] }
      ]
    },

    run: {
      collection: "workflowRuns", idPrefix: "RUN", label: "Workflow Run",
      fields: [
        { key: "title",       label: "Title",        type: "text",    required: true },
        { key: "workflowId",  label: "Workflow",     type: "select",  required: true,
          options: () => D().workflows.map(w => ({ value: w.id, label: w.name })) },
        { key: "description", label: "Description",  type: "textarea"                },
        { key: "requestedBy", label: "Requested By", type: "select",  required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "assignedTo",  label: "Assigned To",  type: "select",  required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "priority",    label: "Priority",     type: "select",  required: true,
          options: ["High","Medium","Low"] },
        { key: "status",      label: "Status",       type: "select",  required: true,
          options: ["In Progress","On Hold","Completed","Cancelled"] },
        { key: "startDate",   label: "Start Date",   type: "date"                    },
        { key: "targetDate",  label: "Target Date",  type: "date"                    },
        { key: "notes",       label: "Notes",        type: "textarea"                }
      ]
    },

    template: {
      collection: "templates", idPrefix: "TMP", label: "Template",
      fields: [
        { key: "name",            label: "Name",             type: "text",        required: true },
        { key: "type",            label: "Type",             type: "select",      required: true,
          options: ["Form","Template","Checklist","Job Aid","Report"] },
        { key: "description",     label: "Description",      type: "textarea",    required: true },
        { key: "owner",           label: "Owner",            type: "select",      required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "audience",        label: "Audience",         type: "text"                        },
        { key: "status",          label: "Status",           type: "select",      required: true,
          options: ["Active","Draft","Archived"] },
        { key: "version",         label: "Version",          type: "text",        default: "1.0"  },
        { key: "linkedWorkflows", label: "Linked Workflows", type: "multiselect",
          options: () => D().workflows.map(w => ({ value: w.id, label: w.name })) }
      ]
    },

    learningAsset: {
      collection: "learningAssets", idPrefix: "LA", label: "Learning Asset",
      fields: [
        { key: "title",             label: "Title",              type: "text",        required: true },
        { key: "type",              label: "Type",               type: "select",      required: true,
          options: ["Course","Microlearning","Job Aid","Video","Workshop"] },
        { key: "description",       label: "Description",        type: "textarea",    required: true },
        { key: "owner",             label: "Owner",              type: "select",      required: true,
          options: () => D().roles.map(r => ({ value: r.id, label: r.name })) },
        { key: "requiredOrOptional",label: "Required / Optional",type: "select",      required: true,
          options: ["Required","Optional"] },
        { key: "estimatedDuration", label: "Estimated Duration", type: "text"                       },
        { key: "status",            label: "Status",             type: "select",      required: true,
          options: ["Active","In Development","Archived"] },
        { key: "linkedWorkflows",   label: "Linked Workflows",   type: "multiselect",
          options: () => D().workflows.map(w => ({ value: w.id, label: w.name })) }
      ]
    },

    role: {
      collection: "roles", idPrefix: "ROLE", label: "Role",
      fields: [
        { key: "name",    label: "Role Name", type: "text",     required: true },
        { key: "type",    label: "Type",      type: "select",   required: true,
          options: ["Program Owner","Approver","Requester","Contributor","Analyst"] },
        { key: "purpose", label: "Purpose",   type: "textarea", required: true },
        { key: "active",  label: "Active",    type: "select",   required: true,
          options: [{ value: "true", label: "Yes" },{ value: "false", label: "No" }] }
      ]
    }
  };

  /* ── Generic Form Open ─────────────────────────────────────── */
  function openEntityForm(type, existing) {
    const schema = SCHEMAS[type];
    if (!schema) { console.error("Unknown entity type:", type); return; }
    const isEdit   = !!existing;
    const title    = `${isEdit ? "Edit" : "Add"} ${schema.label}`;
    const bodyHTML = schema.fields.map(f => buildField(f, isEdit ? existing[f.key] : undefined)).join("");
    const footer   = `<button class="btn btn--ghost" id="modal-cancel">Cancel</button>
      <button class="btn btn--primary" id="modal-save">Save ${schema.label}</button>`;

    showModal(title, bodyHTML, footer, () => { if (window.route) window.route(); });

    document.getElementById("modal-cancel").addEventListener("click", closeModal);
    document.getElementById("modal-save").addEventListener("click", () => {
      const form   = document.querySelector("#crud-overlay .modal__body");
      const data   = collectForm(form, schema);
      const errors = validateForm(data, schema);
      if (errors.length) { alert("Please fix:\n\u2022 " + errors.join("\n\u2022 ")); return; }

      const collection = D()[schema.collection];
      if (isEdit) {
        Object.assign(existing, data);
        toast(`${schema.label} updated`, "success");
      } else {
        data.id = nextId(schema.collection, schema.idPrefix);
        collection.push(data);
        toast(`${schema.label} added`, "success");
      }
      if (type === "role") {
        const target = collection.find(e => e.id === (isEdit ? existing.id : data.id));
        if (target) target.active = (target.active === "true" || target.active === true);
      }
      STORE.save();
      closeModal();
    });
  }

  /* ── Generic Delete ────────────────────────────────────────── */
  function deleteEntity(type, id) {
    const schema = SCHEMAS[type];
    if (!schema) return;
    if (!confirm(`Delete this ${schema.label}? This cannot be undone.`)) return;
    const col = D()[schema.collection];
    const idx = col.findIndex(e => e.id === id);
    if (idx === -1) { toast("Item not found", "error"); return; }
    col.splice(idx, 1);
    STORE.save();
    toast(`${schema.label} deleted`, "success");
    if (window.route) window.route();
  }

  /* ── Stage Advancement (with Decision Log) ─────────────────── */
  function advanceRunStage(runId) {
    const run = D().workflowRuns.find(r => r.id === runId);
    if (!run) return;
    const wf     = D().workflows.find(w => w.id === run.workflowId);
    if (!wf) return;
    const stages  = [...wf.stages].sort((a, b) => a.order - b.order);
    const current = stages.findIndex(s => s.name === run.currentStage);
    if (current === -1 || current >= stages.length - 1) {
      toast("Already at final stage", "info"); return;
    }
    const nextStage      = stages[current + 1];
    const l2             = window.AGENTS ? window.AGENTS.sniff.L2(run, "workflow_run") : { alerts: [] };
    const criticalAlerts = l2.alerts.filter(a => a.level === "Critical");
    if (criticalAlerts.length) {
      const ok = confirm(
        `Critical checks before advancing:\n\n${criticalAlerts.map(a => "\u2022 " + a.msg).join("\n")}\n\nAdvance anyway?`
      );
      if (!ok) return;
    }
    const log = {
      id: nextId("decisionLogs", "DL"),
      entityType: "WorkflowRun", entityId: runId,
      action: "STAGE_ADVANCED",
      fromStage: run.currentStage, toStage: nextStage.name,
      performedBy: window.AUTH ? (window.AUTH.getUser()?.email || "system") : "system",
      performedAt: new Date().toISOString(),
      l2AlertCount: l2.alerts.length,
      overrideApplied: criticalAlerts.length > 0,
      notes: ""
    };
    (D().decisionLogs = D().decisionLogs || []).push(log);
    run.currentStage = nextStage.name;
    if (current + 1 === stages.length - 1) run.status = "Completed";
    STORE.save();
    toast(`Advanced to: ${nextStage.name}`, "success");
    if (window.route) window.route();
  }

  /* ── Public API ────────────────────────────────────────────── */
  window.CRUD = {
    open:         openEntityForm,
    delete:       deleteEntity,
    advanceStage: advanceRunStage,
    toast,
    // Named aliases for backward compatibility
    openActionForm:      (e)     => openEntityForm("action", e),
    openRiskForm:        (e)     => openEntityForm("risk", e),
    openDocumentForm:    (e)     => openEntityForm("document", e),
    openKPIForm:         (e)     => openEntityForm("kpi", e),
    openRunForm:         (e)     => openEntityForm("run", e),
    openTemplateForm:    (e)     => openEntityForm("template", e),
    openLearningForm:    (e)     => openEntityForm("learningAsset", e),
    openRoleForm:        (e)     => openEntityForm("role", e),
    deleteAction:        (id)    => deleteEntity("action", id),
    deleteRisk:          (id)    => deleteEntity("risk", id),
    deleteDocument:      (id)    => deleteEntity("document", id),
    deleteRun:           (id)    => deleteEntity("run", id),
    deleteTemplate:      (id)    => deleteEntity("template", id),
    deleteLearningAsset: (id)    => deleteEntity("learningAsset", id),
    deleteRole:          (id)    => deleteEntity("role", id)
  };
})();
