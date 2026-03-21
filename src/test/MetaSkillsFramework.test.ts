import { describe, it, expect } from "vitest";
import {
  META_SKILLS_FRAMEWORK,
  META_SKILLS_BY_DOMAIN,
  DOMAIN_DESCRIPTIONS,
  applyToAllAgents,
  getSkillById,
  getSkillsByDomain
} from "@/core/MetaSkillsFramework";

describe("MetaSkillsFramework — structure", () => {
  it("has exactly 39 meta-skills", () => {
    expect(META_SKILLS_FRAMEWORK).toHaveLength(39);
  });

  it("has 6 domains", () => {
    expect(Object.keys(META_SKILLS_BY_DOMAIN)).toHaveLength(6);
  });

  it("every skill has required fields", () => {
    META_SKILLS_FRAMEWORK.forEach(skill => {
      expect(skill.id).toBeTruthy();
      expect(skill.domain).toBeTruthy();
      expect(skill.domainName).toBeTruthy();
      expect(skill.name).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.applicationGuidance).toBeTruthy();
      expect(skill.equityRelevance).toBeTruthy();
    });
  });

  it("all skill IDs are unique", () => {
    const ids = META_SKILLS_FRAMEWORK.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("domains M1-M6 all exist", () => {
    const domains = ["M1", "M2", "M3", "M4", "M5", "M6"];
    domains.forEach(d => {
      expect(META_SKILLS_BY_DOMAIN).toHaveProperty(d);
    });
  });

  it("M1 has 7 skills", () => {
    expect(META_SKILLS_BY_DOMAIN["M1"].skills).toHaveLength(7);
  });

  it("M2 has 7 skills", () => {
    expect(META_SKILLS_BY_DOMAIN["M2"].skills).toHaveLength(7);
  });

  it("M3 has 6 skills", () => {
    expect(META_SKILLS_BY_DOMAIN["M3"].skills).toHaveLength(6);
  });

  it("M4 has 7 skills", () => {
    expect(META_SKILLS_BY_DOMAIN["M4"].skills).toHaveLength(7);
  });

  it("M5 has 6 skills", () => {
    expect(META_SKILLS_BY_DOMAIN["M5"].skills).toHaveLength(6);
  });

  it("M6 has 6 skills", () => {
    expect(META_SKILLS_BY_DOMAIN["M6"].skills).toHaveLength(6);
  });

  it("skill counts in DOMAIN_DESCRIPTIONS match actual skill counts", () => {
    (["M1", "M2", "M3", "M4", "M5", "M6"] as const).forEach(domain => {
      expect(DOMAIN_DESCRIPTIONS[domain].skillCount).toBe(
        META_SKILLS_BY_DOMAIN[domain].skills.length
      );
    });
  });
});

describe("getSkillById", () => {
  it("returns correct skill by ID", () => {
    const skill = getSkillById("M1-01");
    expect(skill).toBeDefined();
    expect(skill?.name).toBe("Structural Analysis");
  });

  it("returns undefined for unknown ID", () => {
    expect(getSkillById("Z9-99")).toBeUndefined();
  });

  it("finds skills across all domains", () => {
    expect(getSkillById("M6-06")).toBeDefined();
    expect(getSkillById("M3-04")).toBeDefined();
  });
});

describe("getSkillsByDomain", () => {
  it("returns all M1 skills", () => {
    const skills = getSkillsByDomain("M1");
    expect(skills).toHaveLength(7);
    skills.forEach(s => expect(s.domain).toBe("M1"));
  });

  it("returns all M6 skills", () => {
    const skills = getSkillsByDomain("M6");
    expect(skills).toHaveLength(6);
  });

  it("returns empty array for invalid domain", () => {
    // @ts-expect-error - testing invalid input
    expect(getSkillsByDomain("M9")).toHaveLength(0);
  });
});

describe("applyToAllAgents", () => {
  it("includes all 39 skills in output", () => {
    const output = applyToAllAgents("test context");
    expect(output).toContain("39 meta-skills");
  });

  it("includes the context string", () => {
    const output = applyToAllAgents("policy-drafting agent");
    expect(output).toContain("policy-drafting agent");
  });

  it("includes all 6 domain rules", () => {
    const output = applyToAllAgents("test");
    expect(output).toContain("M1 domain");
    expect(output).toContain("M2 domain");
    expect(output).toContain("M3 domain");
    expect(output).toContain("M4 domain");
    expect(output).toContain("M5 domain");
    expect(output).toContain("M6 domain");
  });

  it("includes skill IDs in output", () => {
    const output = applyToAllAgents("test");
    expect(output).toContain("[M1-01]");
    expect(output).toContain("[M6-06]");
  });

  it("returns a non-empty string", () => {
    const output = applyToAllAgents("test");
    expect(typeof output).toBe("string");
    expect(output.length).toBeGreaterThan(100);
  });
});
