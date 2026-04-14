const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');

const DB_FILENAME = 'incidents.json';

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const STATUS_OPTIONS = ['New', 'In Review', 'Resolved', 'Escalated'];
const CATEGORY_OPTIONS = [
  'Harassment',
  'Discrimination',
  'Bullying',
  'Threatening Language',
  'Retaliation',
  'Other'
];

function getDefaultOptions() {
  return {
    severityOptions: SEVERITY_OPTIONS,
    statusOptions: STATUS_OPTIONS,
    categoryOptions: CATEGORY_OPTIONS
  };
}

function dbPath(basePath) {
  return path.join(basePath, DB_FILENAME);
}

function ensureStore(basePath) {
  const target = dbPath(basePath);

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify({ incidents: [] }, null, 2));
  }

  return target;
}

function readDb(basePath) {
  const target = ensureStore(basePath);
  const data = fs.readFileSync(target, 'utf8');
  return JSON.parse(data);
}

function writeDb(basePath, value) {
  fs.writeFileSync(dbPath(basePath), JSON.stringify(value, null, 2));
}

function validateIncident(incident) {
  const requiredFields = [
    'occurredAt',
    'location',
    'peopleInvolved',
    'category',
    'severity',
    'shortDescription',
    'detailedDescription',
    'impact',
    'status'
  ];

  const missing = requiredFields.filter((key) => !String(incident[key] || '').trim());

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }

  return null;
}

function listIncidents(basePath, filters = {}) {
  const db = readDb(basePath);

  return db.incidents
    .filter((incident) => (filters.severity ? incident.severity === filters.severity : true))
    .filter((incident) => (filters.status ? incident.status === filters.status : true))
    .filter((incident) => (filters.category ? incident.category === filters.category : true))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

function addIncident(basePath, incident) {
  const validationError = validateIncident(incident);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const db = readDb(basePath);
  const newIncident = {
    id: crypto.randomUUID(),
    occurredAt: incident.occurredAt,
    location: incident.location,
    peopleInvolved: incident.peopleInvolved,
    category: incident.category,
    severity: incident.severity,
    shortDescription: incident.shortDescription,
    detailedDescription: incident.detailedDescription,
    impact: incident.impact,
    evidence: incident.evidence || '',
    actionsTaken: incident.actionsTaken || '',
    status: incident.status,
    createdAt: new Date().toISOString()
  };

  db.incidents.push(newIncident);
  writeDb(basePath, db);

  return { ok: true, incident: newIncident };
}

module.exports = {
  ensureStore,
  listIncidents,
  addIncident,
  getDefaultOptions
};
