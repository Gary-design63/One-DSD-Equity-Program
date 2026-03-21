import { describe, it, expect } from "vitest";
import { PRIMARY_DIRECTIVE } from "@/core/PrimaryDirective";

describe("PrimaryDirective", () => {
  it("has the correct directive text", () => {
    expect(PRIMARY_DIRECTIVE.text).toBe(
      "Every agent, every process, every output must multiply the Consultant's capacity, never divide it."
    );
  });

  it("has exactly 10 force multiplier rules", () => {
    expect(PRIMARY_DIRECTIVE.forceMultiplierRules).toHaveLength(10);
  });

  it("first rule is about absorbing work", () => {
    expect(PRIMARY_DIRECTIVE.forceMultiplierRules[0]).toContain("Absorb work");
  });

  it("includes draft-ready output rule", () => {
    const hasDraftReady = PRIMARY_DIRECTIVE.forceMultiplierRules.some(r =>
      r.toLowerCase().includes("draft-ready")
    );
    expect(hasDraftReady).toBe(true);
  });

  it("includes problem-solution pairing rule", () => {
    const hasProblemSolution = PRIMARY_DIRECTIVE.forceMultiplierRules.some(r =>
      r.toLowerCase().includes("problem") && r.toLowerCase().includes("solution")
    );
    expect(hasProblemSolution).toBe(true);
  });

  it("includes one-person-department parity rule", () => {
    const hasParity = PRIMARY_DIRECTIVE.forceMultiplierRules.some(r =>
      r.toLowerCase().includes("one-person-department")
    );
    expect(hasParity).toBe(true);
  });

  it("all rules are non-empty strings", () => {
    PRIMARY_DIRECTIVE.forceMultiplierRules.forEach(rule => {
      expect(typeof rule).toBe("string");
      expect(rule.trim().length).toBeGreaterThan(0);
    });
  });
});
