/**
 * One DSD Equity Program — Database Layer
 * SQLite via better-sqlite3 (synchronous, zero-latency for agent tool calls)
 */

import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = process.env.DB_PATH || './data/equity_program.db';

// Ensure directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for concurrent reads during agent operations
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ─────────────────────────────────────────────────────────────────

db.exec(`
  -- Conversation sessions (one per user session or topic thread)
  CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    title       TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now')),
    meta        TEXT DEFAULT '{}'  -- JSON for flexible metadata
  );

  -- Individual messages within conversations
  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK(role IN ('user','assistant','agent','system')),
    agent_name      TEXT,           -- which agent produced this (null for user/system)
    content         TEXT NOT NULL,
    tool_calls      TEXT,           -- JSON array of tool calls made
    tool_results    TEXT,           -- JSON array of tool results
    created_at      TEXT DEFAULT (datetime('now')),
    tokens_used     INTEGER DEFAULT 0
  );

  -- Agent task queue (agentic background tasks)
  CREATE TABLE IF NOT EXISTS tasks (
    id            TEXT PRIMARY KEY,
    type          TEXT NOT NULL,    -- 'scheduled','triggered','delegated'
    agent_name    TEXT NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','running','completed','failed','cancelled')),
    priority      INTEGER DEFAULT 5, -- 1=critical, 10=low
    scheduled_for TEXT,             -- ISO datetime for scheduled tasks
    context       TEXT DEFAULT '{}', -- JSON context for the task
    result        TEXT,             -- JSON result when completed
    error         TEXT,
    created_at    TEXT DEFAULT (datetime('now')),
    started_at    TEXT,
    completed_at  TEXT
  );

  -- Agent-generated insights (persistent knowledge the agents accumulate)
  CREATE TABLE IF NOT EXISTS insights (
    id              TEXT PRIMARY KEY,
    agent_name      TEXT NOT NULL,
    insight_type    TEXT NOT NULL,  -- 'risk_flag','pattern','recommendation','briefing','alert'
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    related_entities TEXT DEFAULT '[]', -- JSON array: [{type:'workflow',id:'WF-001'}]
    confidence      REAL DEFAULT 0.8,
    is_active       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now')),
    expires_at      TEXT            -- null = never expires
  );

  -- Audit log — every agent action is recorded
  CREATE TABLE IF NOT EXISTS audit_log (
    id          TEXT PRIMARY KEY,
    agent_name  TEXT,
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   TEXT,
    detail      TEXT,               -- JSON detail
    user_id     TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Cached snapshots of app data entities for agent tools
  CREATE TABLE IF NOT EXISTS entity_cache (
    entity_type TEXT NOT NULL,  -- 'document','workflow','kpi','template','learning','action','risk','role'
    entity_id   TEXT NOT NULL,
    data        TEXT NOT NULL,  -- full JSON of the entity
    updated_at  TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (entity_type, entity_id)
  );

  -- Agent-to-agent delegation log
  CREATE TABLE IF NOT EXISTS delegations (
    id              TEXT PRIMARY KEY,
    from_agent      TEXT NOT NULL,
    to_agent        TEXT NOT NULL,
    task_summary    TEXT NOT NULL,
    context         TEXT DEFAULT '{}',
    response        TEXT,
    status          TEXT DEFAULT 'pending',
    created_at      TEXT DEFAULT (datetime('now')),
    resolved_at     TEXT
  );

  -- Per-agent long-term memory (persists across conversations)
  CREATE TABLE IF NOT EXISTS agent_memory (
    agent_name    TEXT NOT NULL,
    memory_type   TEXT NOT NULL,  -- 'program_context','preferences','patterns','key_facts'
    content       TEXT NOT NULL,  -- Free-form text or JSON
    updated_at    TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (agent_name, memory_type)
  );

  -- Staff learning completion records
  CREATE TABLE IF NOT EXISTS learning_completions (
    id            TEXT PRIMARY KEY,
    asset_id      TEXT NOT NULL,
    user_id       TEXT NOT NULL,
    user_name     TEXT,
    completed_at  TEXT DEFAULT (datetime('now')),
    notes         TEXT
  );

  -- Document version history
  CREATE TABLE IF NOT EXISTS document_versions (
    id              TEXT PRIMARY KEY,
    document_id     TEXT NOT NULL,
    version         TEXT NOT NULL,
    content_snapshot TEXT NOT NULL,  -- Full JSON snapshot of the document at this version
    changed_by      TEXT,
    change_note     TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  -- Indexes for common query patterns
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status, scheduled_for);
  CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type, is_active);
  CREATE INDEX IF NOT EXISTS idx_audit_agent ON audit_log(agent_name, created_at);
  CREATE INDEX IF NOT EXISTS idx_entity_cache_type ON entity_cache(entity_type);
  CREATE INDEX IF NOT EXISTS idx_completions_asset ON learning_completions(asset_id);
  CREATE INDEX IF NOT EXISTS idx_completions_user ON learning_completions(user_id);
  CREATE INDEX IF NOT EXISTS idx_doc_versions ON document_versions(document_id, created_at);
`);

// ── Query Helpers ───────────────────────────────────────────────────────────

export const queries = {

  // Conversations
  createConversation: db.prepare(`
    INSERT INTO conversations (id, title, meta) VALUES (?, ?, ?)
  `),
  getConversation: db.prepare(`SELECT * FROM conversations WHERE id = ?`),
  updateConversationTitle: db.prepare(`
    UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ?
  `),
  listConversations: db.prepare(`
    SELECT c.*, COUNT(m.id) as message_count,
           MAX(m.created_at) as last_message_at
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    GROUP BY c.id
    ORDER BY last_message_at DESC
    LIMIT ?
  `),

  // Messages
  addMessage: db.prepare(`
    INSERT INTO messages (id, conversation_id, role, agent_name, content, tool_calls, tool_results, tokens_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getMessages: db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `),
  getRecentMessages: db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ?
    ORDER BY created_at DESC LIMIT ?
  `),

  // Tasks
  createTask: db.prepare(`
    INSERT INTO tasks (id, type, agent_name, title, description, priority, scheduled_for, context)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getPendingTasks: db.prepare(`
    SELECT * FROM tasks
    WHERE status = 'pending' AND (scheduled_for IS NULL OR scheduled_for <= datetime('now'))
    ORDER BY priority ASC, created_at ASC
  `),
  getTasksByAgent: db.prepare(`
    SELECT * FROM tasks WHERE agent_name = ? ORDER BY created_at DESC LIMIT ?
  `),
  updateTaskStatus: db.prepare(`
    UPDATE tasks SET status = ?, result = ?, error = ?,
      started_at = CASE WHEN ? = 'running' THEN datetime('now') ELSE started_at END,
      completed_at = CASE WHEN ? IN ('completed','failed') THEN datetime('now') ELSE completed_at END
    WHERE id = ?
  `),
  listRecentTasks: db.prepare(`
    SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?
  `),

  // Insights
  addInsight: db.prepare(`
    INSERT INTO insights (id, agent_name, insight_type, title, content, related_entities, confidence, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  getActiveInsights: db.prepare(`
    SELECT * FROM insights
    WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
    ORDER BY created_at DESC
    LIMIT ?
  `),
  getInsightsByType: db.prepare(`
    SELECT * FROM insights WHERE insight_type = ? AND is_active = 1
    ORDER BY created_at DESC LIMIT ?
  `),
  deactivateInsight: db.prepare(`UPDATE insights SET is_active = 0 WHERE id = ?`),

  // Audit log
  addAuditEntry: db.prepare(`
    INSERT INTO audit_log (id, agent_name, action, entity_type, entity_id, detail, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  getAuditLog: db.prepare(`
    SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?
  `),
  getAuditByAgent: db.prepare(`
    SELECT * FROM audit_log WHERE agent_name = ? ORDER BY created_at DESC LIMIT ?
  `),

  // Entity cache (app data sync)
  upsertEntity: db.prepare(`
    INSERT INTO entity_cache (entity_type, entity_id, data, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(entity_type, entity_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `),
  getEntity: db.prepare(`SELECT * FROM entity_cache WHERE entity_type = ? AND entity_id = ?`),
  getEntitiesByType: db.prepare(`SELECT * FROM entity_cache WHERE entity_type = ?`),
  searchEntities: db.prepare(`
    SELECT * FROM entity_cache WHERE entity_type = ? AND data LIKE ?
  `),

  // Delegations
  createDelegation: db.prepare(`
    INSERT INTO delegations (id, from_agent, to_agent, task_summary, context)
    VALUES (?, ?, ?, ?, ?)
  `),
  resolveDelegation: db.prepare(`
    UPDATE delegations SET response = ?, status = ?, resolved_at = datetime('now') WHERE id = ?
  `),
  getPendingDelegations: db.prepare(`
    SELECT * FROM delegations WHERE status = 'pending' ORDER BY created_at ASC
  `),

  // Agent memory
  getAgentMemory: db.prepare(`SELECT * FROM agent_memory WHERE agent_name = ?`),
  getMemoryEntry: db.prepare(`SELECT * FROM agent_memory WHERE agent_name = ? AND memory_type = ?`),
  upsertMemory: db.prepare(`
    INSERT INTO agent_memory (agent_name, memory_type, content, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(agent_name, memory_type) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at
  `),
  deleteMemoryEntry: db.prepare(`DELETE FROM agent_memory WHERE agent_name = ? AND memory_type = ?`),

  // Learning completions
  addCompletion: db.prepare(`
    INSERT INTO learning_completions (id, asset_id, user_id, user_name, notes)
    VALUES (?, ?, ?, ?, ?)
  `),
  getCompletionsByAsset: db.prepare(`SELECT * FROM learning_completions WHERE asset_id = ? ORDER BY completed_at DESC`),
  getCompletionsByUser: db.prepare(`SELECT * FROM learning_completions WHERE user_id = ? ORDER BY completed_at DESC`),
  getAllCompletions: db.prepare(`SELECT * FROM learning_completions ORDER BY completed_at DESC LIMIT ?`),
  deleteCompletion: db.prepare(`DELETE FROM learning_completions WHERE id = ?`),
  getCompletionSummary: db.prepare(`
    SELECT asset_id, COUNT(*) as completion_count, MAX(completed_at) as last_completed
    FROM learning_completions GROUP BY asset_id
  `),

  // Document versions
  addDocumentVersion: db.prepare(`
    INSERT INTO document_versions (id, document_id, version, content_snapshot, changed_by, change_note)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  getDocumentVersions: db.prepare(`
    SELECT id, document_id, version, changed_by, change_note, created_at
    FROM document_versions WHERE document_id = ? ORDER BY created_at DESC
  `),
  getDocumentVersion: db.prepare(`SELECT * FROM document_versions WHERE id = ?`),
  getLatestVersion: db.prepare(`
    SELECT * FROM document_versions WHERE document_id = ? ORDER BY created_at DESC LIMIT 1
  `)
};

// ── Utility functions ───────────────────────────────────────────────────────

export function audit(agentName, action, entityType, entityId, detail, userId = null) {
  const { v4: uuidv4 } = { v4: () => crypto.randomUUID() };
  queries.addAuditEntry.run(
    crypto.randomUUID(),
    agentName,
    action,
    entityType || null,
    entityId || null,
    detail ? JSON.stringify(detail) : null,
    userId
  );
}

export function syncEntityCache(appData) {
  const syncBatch = db.transaction((data) => {
    const entityMap = {
      document: data.documents || [],
      workflow: data.workflows || [],
      kpi: data.kpis || [],
      template: data.templates || [],
      learning: data.learningAssets || [],
      action: data.actions || [],
      risk: data.risks || [],
      role: data.roles || []
    };

    for (const [type, entities] of Object.entries(entityMap)) {
      if (!Array.isArray(entities)) continue;
      for (const entity of entities) {
        const id = entity.id || entity.kpiId || `${type}-${Date.now()}`;
        queries.upsertEntity.run(type, id, JSON.stringify(entity));
      }
    }
  });

  syncBatch(appData);
}

export function searchEntityCache(entityType, searchTerm) {
  const pattern = `%${searchTerm}%`;
  const rows = queries.searchEntities.all(entityType, pattern);
  return rows.map(r => JSON.parse(r.data));
}

export function getAllEntities(entityType) {
  const rows = queries.getEntitiesByType.all(entityType);
  return rows.map(r => JSON.parse(r.data));
}

export function getAgentMemory(agentName) {
  const rows = queries.getAgentMemory.all(agentName);
  return rows.reduce((acc, row) => {
    acc[row.memory_type] = row.content;
    return acc;
  }, {});
}

export function setAgentMemory(agentName, memoryType, content) {
  queries.upsertMemory.run(agentName, memoryType, typeof content === 'string' ? content : JSON.stringify(content));
}

export default db;
