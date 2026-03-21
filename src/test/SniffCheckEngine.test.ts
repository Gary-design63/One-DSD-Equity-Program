import { describe, it, expect } from "vitest";
import {
  runL1Check,
  runL2Check,
  runL3Check,
  runSniffCheck,
  formatSniffCheckReport,
  getUniversalChecks,
  L1_CRITERIA,
  L2_CRITERIA,
  L3_CRITERIA
} from "@/core/SniffCheckEngine";
import type { SniffCheckContext } from "@/core/SniffCheckEngine";

const baseContext: SniffCheckContext = {
  agentId: "policy-drafting",
  outputType: "policy",
  audience: "staff",
  contentType: "text"
};

const goodPolicyContent = `
This policy brief addresses the structural barriers that prevent Black and Indigenous Minnesotans
with disabilities from accessing CADI waiver services equitably. Root causes include systemic racism
embedded in eligibility criteria and geographic disparities in provider availability.

We recommend three immediate actions: (1) Conduct a disparity audit of waiver approvals disaggregated
by race and ethnicity, (2) Expand provider capacity in North Minneapolis and Greater MN, and
(3) Establish a community advisory panel with lived experience leadership.

This analysis uses intersectional frameworks and centers community voice from people with disabilities
across multiple marginalized identities. Language access materials are available in Somali, Spanish,
and Hmong.
`;

// ============================================================
// L1 CRITERIA UNIT TESTS
// ============================================================
describe("L1-001: Force Multiplier Alignment", () => {
  it("PASS for output that delivers complete work", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-001");
    expect(criterion?.status).toBe("PASS");
  });

  it("WARNING when output instructs consultant to do work", () => {
    const overheadContent = "You need to review this document and please do a follow-up analysis.";
    const result = runL1Check(overheadContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-001");
    expect(criterion?.status).toBe("WARNING");
  });
});

describe("L1-002: Draft-Ready Output Standard", () => {
  it("PASS for complete content", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-002");
    expect(criterion?.status).toBe("PASS");
  });

  it("FAIL when content has [placeholder]", () => {
    const incomplete = "This policy covers [placeholder] topics for [insert community].";
    const result = runL1Check(incomplete, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-002");
    expect(criterion?.status).toBe("FAIL");
  });

  it("FAIL when content has TODO:", () => {
    const incomplete = "TODO: add statistics here. The policy addresses waiver access.";
    const result = runL1Check(incomplete, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-002");
    expect(criterion?.status).toBe("FAIL");
  });

  it("FAIL when content has [TBD]", () => {
    const incomplete = "Implementation timeline: [TBD]";
    const result = runL1Check(incomplete, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-002");
    expect(criterion?.status).toBe("FAIL");
  });
});

describe("L1-003: Solution Attachment Verification", () => {
  it("PASS when problem has a solution", () => {
    const content = "The problem is waiver access disparities. We recommend expanding eligibility review.";
    const result = runL1Check(content, { ...baseContext, outputType: "communication" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-003");
    expect(criterion?.status).toBe("PASS");
  });

  it("FAIL when problem raised without solution", () => {
    const content = "The main issue is a serious barrier and challenge for these communities. There is no clear path forward.";
    const result = runL1Check(content, { ...baseContext, outputType: "communication" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-003");
    expect(criterion?.status).toBe("FAIL");
  });

  it("PASS when no problem keywords present", () => {
    const content = "This training module covers equity foundations and cultural responsiveness.";
    const result = runL1Check(content, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-003");
    expect(criterion?.status).toBe("PASS");
  });
});

describe("L1-004: Minimum Content Length", () => {
  it("PASS when policy content meets 300-char minimum", () => {
    expect(goodPolicyContent.trim().length).toBeGreaterThan(300);
    const result = runL1Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-004");
    expect(criterion?.status).toBe("PASS");
  });

  it("WARNING for short policy content", () => {
    const short = "This is a brief note.";
    const result = runL1Check(short, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-004");
    expect(criterion?.status).toBe("WARNING");
  });

  it("PASS for short communication content above 50-char minimum", () => {
    const content = "This letter informs you of your upcoming waiver review appointment scheduled for March.";
    const result = runL1Check(content, { ...baseContext, outputType: "communication" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-004");
    expect(criterion?.status).toBe("PASS");
  });
});

describe("L1-005: Ableist Language Detection", () => {
  it("PASS for clean content", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-005");
    expect(criterion?.status).toBe("PASS");
  });

  it("FAIL when ableist term 'wheelchair-bound' is used", () => {
    const ableist = goodPolicyContent + " This policy serves wheelchair-bound individuals.";
    const result = runL1Check(ableist, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-005");
    expect(criterion?.status).toBe("FAIL");
    expect(criterion?.evidence).toContain("wheelchair-bound");
  });

  it("FAIL when 'suffers from' is used", () => {
    const ableist = goodPolicyContent + " Many people suffers from chronic conditions.";
    const result = runL1Check(ableist, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-005");
    expect(criterion?.status).toBe("FAIL");
  });

  it("FAIL when 'confined to a wheelchair' is used", () => {
    const ableist = goodPolicyContent + " Participants confined to a wheelchair need accessible transportation.";
    const result = runL1Check(ableist, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-005");
    expect(criterion?.status).toBe("FAIL");
  });
});

describe("L1-006: Racial Slur / Harm Detection", () => {
  it("PASS for clean equity content", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-006");
    expect(criterion?.status).toBe("PASS");
  });

  it("FAIL for content with racial hierarchy language", () => {
    const harmful = goodPolicyContent + " This theory supports a racial hierarchy of outcomes.";
    const result = runL1Check(harmful, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-006");
    expect(criterion?.status).toBe("FAIL");
  });
});

describe("L1-007: Minnesota-Specific Accuracy Markers", () => {
  it("PASS (no MN content) for generic text", () => {
    const generic = "This policy addresses equity in disability services nationwide.";
    const result = runL1Check(generic, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-007");
    expect(criterion?.status).toBe("PASS");
  });

  it("WARNING when MN programs mentioned (requires human verification)", () => {
    const mnContent = goodPolicyContent; // contains "CADI" and "Olmstead"
    const result = runL1Check(mnContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-007");
    expect(criterion?.status).toBe("WARNING");
  });
});

describe("L1-008: Audience Alignment Check", () => {
  it("PASS for community audience with plain language", () => {
    const plain = "This program helps people with disabilities get the services they need in their community.";
    const result = runL1Check(plain, { ...baseContext, audience: "community" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-008");
    expect(criterion?.status).toBe("PASS");
  });

  it("WARNING for community audience with heavy acronyms", () => {
    const acronymHeavy = "The MMIS HCBS ICF DSP PCA CBSM CMS DD BI CADI waiver program supports community integration outcomes.";
    const result = runL1Check(acronymHeavy, { ...baseContext, audience: "community" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-008");
    expect(criterion?.status).toBe("WARNING");
  });

  it("PASS for staff audience with technical terms", () => {
    const technical = "The MMIS HCBS CADI waiver program administered via CBSM requires DSP certification.";
    const result = runL1Check(technical, { ...baseContext, audience: "staff" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L1-008");
    expect(criterion?.status).toBe("PASS");
  });
});

// ============================================================
// OVERALL RESULT TESTS
// ============================================================
describe("runL1Check — overall result", () => {
  it("canProceed is true when no failures", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    expect(result.canProceed).toBe(true);
  });

  it("canProceed is false when there are failures", () => {
    const bad = "You need to do this [placeholder] task. The problem is serious. Wheelchair-bound people suffer.";
    const result = runL1Check(bad, { ...baseContext, outputType: "communication" });
    expect(result.canProceed).toBe(false);
  });

  it("result has correct level", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    expect(result.level).toBe("L1");
  });

  it("result has agentId from context", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    expect(result.agentId).toBe("policy-drafting");
  });

  it("result has a timestamp", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    expect(result.timestamp).toBeTruthy();
    expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
  });

  it("result has a unique ID", () => {
    const r1 = runL1Check(goodPolicyContent, baseContext);
    const r2 = runL1Check(goodPolicyContent, baseContext);
    expect(r1.id).not.toBe(r2.id);
  });

  it("summary contains level and pass count", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    expect(result.summary).toContain("L1");
    expect(result.summary).toContain("PASS");
  });

  it("FAIL overallStatus when any criteria fails", () => {
    const bad = "TODO: complete this [placeholder]";
    const result = runL1Check(bad, baseContext);
    expect(result.overallStatus).toBe("FAIL");
  });

  it("passCount + failCount + warningCount + reviewCount equals criteria count", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const total = result.passCount + result.failCount + result.warningCount + result.reviewCount;
    expect(total).toBe(L1_CRITERIA.length);
  });
});

// ============================================================
// L2 TESTS
// ============================================================
describe("runL2Check", () => {
  it("result has level L2", () => {
    const result = runL2Check(goodPolicyContent, baseContext);
    expect(result.level).toBe("L2");
  });

  it("runs both L1 and L2 criteria", () => {
    const result = runL2Check(goodPolicyContent, baseContext);
    expect(result.criteriaResults.length).toBe(L1_CRITERIA.length + L2_CRITERIA.length);
  });

  it("L2-001 PASS when structural terms present", () => {
    const result = runL2Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-001");
    expect(criterion?.status).toBe("PASS");
  });

  it("L2-001 WARNING for individual-focused content", () => {
    const individual = "The individual needs personal support and their family should help with the behavior.";
    const result = runL2Check(individual, { ...baseContext, outputType: "communication" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-001");
    expect(criterion?.status).toBe("WARNING");
  });

  it("L2-002 PASS when intersectional terms present", () => {
    const result = runL2Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-002");
    expect(criterion?.status).toBe("PASS");
  });

  it("L2-003 PASS when community terms present", () => {
    const result = runL2Check(goodPolicyContent, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-003");
    expect(criterion?.status).toBe("PASS");
  });

  it("L2-004 WARNING when data mentioned without disaggregation", () => {
    const aggregateData = "The data shows 45% of participants completed training. The percentage improved this quarter.";
    const result = runL2Check(aggregateData, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-004");
    expect(criterion?.status).toBe("WARNING");
  });

  it("L2-004 PASS when disaggregated terms present", () => {
    const disagg = "Data disaggregated by race shows Black participants at 32% and Indigenous at 28% access rate.";
    const result = runL2Check(disagg, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-004");
    expect(criterion?.status).toBe("PASS");
  });

  it("L2-005 WARNING for community outreach without language access mention", () => {
    const outreach = "This outreach letter informs community members and notifies families of upcoming engagement events.";
    const result = runL2Check(outreach, { ...baseContext, outputType: "communication" });
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-005");
    expect(criterion?.status).toBe("WARNING");
  });

  it("L2-005 PASS when language access mentioned in outreach", () => {
    const outreach = "This outreach letter is available in Somali and Spanish for community engagement events.";
    const result = runL2Check(outreach, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-005");
    expect(criterion?.status).toBe("PASS");
  });

  it("L2-006 WARNING for institutional content without community context", () => {
    const institutional = "Residents in nursing facilities and congregate care institutions will be notified of changes.";
    const result = runL2Check(institutional, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-006");
    expect(criterion?.status).toBe("WARNING");
  });

  it("L2-007 WARNING for service cuts without mitigation", () => {
    const cuts = "The proposal would cut and reduce services, eliminating access for some participants.";
    const result = runL2Check(cuts, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-007");
    expect(criterion?.status).toBe("WARNING");
  });

  it("L2-007 PASS when harm mitigation mentioned alongside cuts", () => {
    const mitigated = "The proposal to reduce services includes a disparity impact analysis and staged implementation with community input.";
    const result = runL2Check(mitigated, baseContext);
    const criterion = result.criteriaResults.find(r => r.criterionId === "L2-007");
    expect(criterion?.status).toBe("PASS");
  });
});

// ============================================================
// L3 TESTS
// ============================================================
describe("runL3Check", () => {
  it("result has level L3", () => {
    const result = runL3Check(goodPolicyContent, baseContext);
    expect(result.level).toBe("L3");
  });

  it("runs L1 + L2 + L3 criteria", () => {
    const result = runL3Check(goodPolicyContent, baseContext);
    expect(result.criteriaResults.length).toBe(
      L1_CRITERIA.length + L2_CRITERIA.length + L3_CRITERIA.length
    );
  });

  it("all L3 criteria are REVIEW_REQUIRED", () => {
    const result = runL3Check(goodPolicyContent, baseContext);
    const l3Results = result.criteriaResults.filter(r =>
      r.criterionId.startsWith("L3-")
    );
    l3Results.forEach(r => {
      expect(r.status).toBe("REVIEW_REQUIRED");
    });
  });

  it("canProceed can still be true if only L3 reviews (no FAIL)", () => {
    // L3 review_required does not block — only FAILs block
    const result = runL3Check(goodPolicyContent, baseContext);
    // Good content should have no FAILs from L1/L2
    expect(result.failCount).toBe(0);
    expect(result.canProceed).toBe(true);
  });
});

// ============================================================
// runSniffCheck — level routing
// ============================================================
describe("runSniffCheck — level routing", () => {
  it("L1 runs only 8 criteria", () => {
    const result = runSniffCheck(goodPolicyContent, "L1", baseContext);
    expect(result.criteriaResults).toHaveLength(L1_CRITERIA.length);
  });

  it("L2 runs L1 + L2 criteria", () => {
    const result = runSniffCheck(goodPolicyContent, "L2", baseContext);
    expect(result.criteriaResults).toHaveLength(L1_CRITERIA.length + L2_CRITERIA.length);
  });

  it("L3 runs all criteria", () => {
    const result = runSniffCheck(goodPolicyContent, "L3", baseContext);
    expect(result.criteriaResults).toHaveLength(
      L1_CRITERIA.length + L2_CRITERIA.length + L3_CRITERIA.length
    );
  });
});

// ============================================================
// getUniversalChecks
// ============================================================
describe("getUniversalChecks", () => {
  it("returns 4 universal checks", () => {
    const checks = getUniversalChecks();
    expect(checks).toHaveLength(4);
  });

  it("includes L1-001, L1-002, L1-003, L1-005", () => {
    const checks = getUniversalChecks();
    const ids = checks.map(c => c.id);
    expect(ids).toContain("L1-001");
    expect(ids).toContain("L1-002");
    expect(ids).toContain("L1-003");
    expect(ids).toContain("L1-005");
  });
});

// ============================================================
// formatSniffCheckReport
// ============================================================
describe("formatSniffCheckReport", () => {
  it("includes SNIFF CHECK REPORT header", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const report = formatSniffCheckReport(result);
    expect(report).toContain("SNIFF CHECK REPORT");
  });

  it("includes agent ID", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const report = formatSniffCheckReport(result);
    expect(report).toContain("policy-drafting");
  });

  it("includes Primary Directive text", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const report = formatSniffCheckReport(result);
    expect(report).toContain("multiply the Consultant's capacity");
  });

  it("shows YES for canProceed on good content", () => {
    const result = runL1Check(goodPolicyContent, baseContext);
    const report = formatSniffCheckReport(result);
    expect(report).toContain("Can Proceed: YES");
  });

  it("shows NO when there are failures", () => {
    const bad = "TODO: [placeholder] You need to manually do this wheelchair-bound task.";
    const result = runL1Check(bad, baseContext);
    const report = formatSniffCheckReport(result);
    expect(report).toContain("Can Proceed: NO");
  });

  it("lists blocking issues when present", () => {
    const bad = "TODO: [placeholder] for this document";
    const result = runL1Check(bad, baseContext);
    const report = formatSniffCheckReport(result);
    expect(report).toContain("BLOCKING ISSUES");
  });
});

// ============================================================
// CRITERIA COUNTS
// ============================================================
describe("Criteria counts", () => {
  it("L1 has 8 criteria", () => {
    expect(L1_CRITERIA).toHaveLength(8);
  });

  it("L2 has 7 criteria", () => {
    expect(L2_CRITERIA).toHaveLength(7);
  });

  it("L3 has 6 criteria", () => {
    expect(L3_CRITERIA).toHaveLength(6);
  });

  it("all L1 criteria have level L1", () => {
    L1_CRITERIA.forEach(c => expect(c.level).toBe("L1"));
  });

  it("all L2 criteria have level L2", () => {
    L2_CRITERIA.forEach(c => expect(c.level).toBe("L2"));
  });

  it("all L3 criteria have level L3", () => {
    L3_CRITERIA.forEach(c => expect(c.level).toBe("L3"));
  });

  it("all criteria have unique IDs", () => {
    const all = [...L1_CRITERIA, ...L2_CRITERIA, ...L3_CRITERIA];
    const ids = all.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
