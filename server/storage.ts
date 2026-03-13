import {
  type Initiative, type InsertInitiative,
  type Kpi, type InsertKpi,
  type Policy, type InsertPolicy,
  type EquityMemory, type InsertEquityMemory,
  type KnowledgeDoc, type InsertKnowledgeDoc,
  type User, type InsertUser,
} from "@shared/schema";

export interface IStorage {
  // Initiatives
  getInitiatives(): Promise<Initiative[]>;
  createInitiative(data: InsertInitiative): Promise<Initiative>;

  // KPIs
  getKpis(): Promise<Kpi[]>;

  // Policies
  getPolicies(): Promise<Policy[]>;

  // Equity Memories
  getEquityMemories(): Promise<EquityMemory[]>;

  // Knowledge Docs
  getKnowledgeDocs(): Promise<KnowledgeDoc[]>;

  // Users
  getUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private initiatives: Map<number, Initiative> = new Map();
  private kpis: Map<number, Kpi> = new Map();
  private policies: Map<number, Policy> = new Map();
  private equityMemories: Map<number, EquityMemory> = new Map();
  private knowledgeDocs: Map<number, KnowledgeDoc> = new Map();
  private users: Map<number, User> = new Map();
  private nextId = 100;

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed KPIs
    const kpiData: Kpi[] = [
      { id: 1, name: "Staff with Disabilities Representation", currentValue: 8.5, targetValue: 15, unit: "%", trend: "up", category: "Workforce" },
      { id: 2, name: "BIPOC Staff in Leadership", currentValue: 18, targetValue: 30, unit: "%", trend: "up", category: "Workforce" },
      { id: 3, name: "Equity Consultation Completion Rate", currentValue: 82, targetValue: 90, unit: "%", trend: "up", category: "Operations" },
      { id: 4, name: "Staff Equity Training Completion", currentValue: 73, targetValue: 100, unit: "%", trend: "up", category: "Training" },
      { id: 5, name: "Language Access Compliance", currentValue: 91, targetValue: 95, unit: "%", trend: "up", category: "Community" },
      { id: 6, name: "Reasonable Accommodation Response Time", currentValue: 3.2, targetValue: 2, unit: "days", trend: "down", category: "Operations" },
      { id: 7, name: "Community Engagement Sessions", currentValue: 12, targetValue: 20, unit: "count", trend: "up", category: "Community" },
      { id: 8, name: "Policy Equity Reviews Completed", currentValue: 6, targetValue: 15, unit: "count", trend: "up", category: "Policy" },
    ];
    kpiData.forEach(k => this.kpis.set(k.id, k));

    // Seed Policies
    const policyData: Policy[] = [
      { id: 1, name: "Accessible Communication Standards", status: "Approved", reviewer: "Maria Chen", lastUpdated: "2026-02-28", equityScore: 92 },
      { id: 2, name: "Reasonable Accommodation Procedures", status: "Under Review", reviewer: "James Walker", lastUpdated: "2026-03-05", equityScore: 78 },
      { id: 3, name: "Cultural Competency Training Framework", status: "Draft", reviewer: "Aisha Johnson", lastUpdated: "2026-03-10", equityScore: 65 },
      { id: 4, name: "Language Access Plan", status: "Under Review", reviewer: "David Nguyen", lastUpdated: "2026-03-01", equityScore: 85 },
      { id: 5, name: "Disability Services Hiring Practices", status: "Needs Revision", reviewer: "Sarah Thompson", lastUpdated: "2026-02-20", equityScore: 58 },
    ];
    policyData.forEach(p => this.policies.set(p.id, p));

    // Seed Equity Memories
    const memoryData: EquityMemory[] = [
      { id: 1, title: "ASL Interpreter Procurement Decision", date: "2026-01-15", category: "Community", summary: "Established preferred vendor list for ASL interpreters across all DSD offices. Decision prioritized certified Deaf interpreters for policy meetings and included video remote interpreting (VRI) as backup option." },
      { id: 2, title: "Flexible Work Policy Equity Review", date: "2025-12-08", category: "Workforce", summary: "Reviewed telework policy through disability equity lens. Identified that rigid in-office requirements disproportionately impacted staff with mobility disabilities. Recommended hybrid-first approach with accommodation built into default policy." },
      { id: 3, title: "Training Material Accessibility Audit", date: "2026-02-22", category: "Training", summary: "Completed audit of 45 training modules. Found 62% met WCAG 2.1 AA standards. Created remediation timeline prioritizing most-used modules. Added alternative text, captions, and keyboard navigation." },
      { id: 4, title: "Community Advisory Board Formation", date: "2025-11-20", category: "Community", summary: "Established 12-member Community Advisory Board with majority representation from people with disabilities. Board includes members from BIPOC, LGBTQ+, and immigrant communities to ensure intersectional perspectives." },
      { id: 5, title: "Data Collection Equity Standards", date: "2026-03-01", category: "Policy", summary: "Adopted new demographic data collection standards that include non-binary gender options, expanded disability categories, and self-identification protocols. Training rolled out to all intake staff." },
    ];
    memoryData.forEach(m => this.equityMemories.set(m.id, m));

    // Seed Knowledge Docs
    const docData: KnowledgeDoc[] = [
      { id: 1, title: "DSD Equity Action Plan FY2026", description: "Comprehensive equity action plan outlining goals, strategies, and metrics for the fiscal year.", fileType: "pdf", dateAdded: "2025-10-01", category: "Policies" },
      { id: 2, title: "DEIA Training Curriculum Guide", description: "Complete guide for facilitators delivering diversity, equity, inclusion, and accessibility training.", fileType: "docx", dateAdded: "2025-11-15", category: "Training" },
      { id: 3, title: "Disability Rights in MN State Government", description: "Research summary on disability rights protections under Minnesota and federal law.", fileType: "pdf", dateAdded: "2025-09-20", category: "Research" },
      { id: 4, title: "Equity Review Request Template", description: "Standard template for initiating an equity review of a policy, program, or practice.", fileType: "docx", dateAdded: "2026-01-10", category: "Templates" },
      { id: 5, title: "Intersectionality Framework for DSD", description: "Framework for analyzing disability services through an intersectional equity lens.", fileType: "pdf", dateAdded: "2025-12-05", category: "Research" },
      { id: 6, title: "Community Engagement Best Practices", description: "Guide for conducting accessible and equitable community engagement sessions.", fileType: "pdf", dateAdded: "2026-02-14", category: "Policies" },
    ];
    docData.forEach(d => this.knowledgeDocs.set(d.id, d));

    // Seed Users
    const userData: User[] = [
      { id: 1, name: "Maria Chen", email: "maria.chen@dhs.mn.gov", role: "Admin", status: "Active" },
      { id: 2, name: "James Walker", email: "james.walker@dhs.mn.gov", role: "Reviewer", status: "Active" },
      { id: 3, name: "Aisha Johnson", email: "aisha.johnson@dhs.mn.gov", role: "Reviewer", status: "Active" },
      { id: 4, name: "David Nguyen", email: "david.nguyen@dhs.mn.gov", role: "Viewer", status: "Active" },
      { id: 5, name: "Sarah Thompson", email: "sarah.thompson@dhs.mn.gov", role: "Admin", status: "Active" },
      { id: 6, name: "Robert Kim", email: "robert.kim@dhs.mn.gov", role: "Viewer", status: "Inactive" },
    ];
    userData.forEach(u => this.users.set(u.id, u));
  }

  async getInitiatives(): Promise<Initiative[]> {
    return Array.from(this.initiatives.values());
  }

  async createInitiative(data: InsertInitiative): Promise<Initiative> {
    const id = this.nextId++;
    const initiative: Initiative = {
      ...data,
      id,
      status: data.status ?? "Submitted",
      assignedTo: data.assignedTo ?? null,
      createdAt: new Date().toISOString(),
    };
    this.initiatives.set(id, initiative);
    return initiative;
  }

  async getKpis(): Promise<Kpi[]> {
    return Array.from(this.kpis.values());
  }

  async getPolicies(): Promise<Policy[]> {
    return Array.from(this.policies.values());
  }

  async getEquityMemories(): Promise<EquityMemory[]> {
    return Array.from(this.equityMemories.values());
  }

  async getKnowledgeDocs(): Promise<KnowledgeDoc[]> {
    return Array.from(this.knowledgeDocs.values());
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
