const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const { ensureStore, addIncident, listIncidents } = require('../src/storage');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'incident-app-'));
}

test('adds an incident and filters by severity', () => {
  const dir = tempDir();
  ensureStore(dir);

  const addResult = addIncident(dir, {
    occurredAt: '2026-04-14T11:20',
    location: 'Engineering channel',
    peopleInvolved: 'Person A, Person B',
    category: 'Harassment',
    severity: 'High',
    shortDescription: 'Hostile comments',
    detailedDescription: 'Repeated insulting comments in thread.',
    impact: 'Team member withdrew from discussion.',
    evidence: 'message-link-42',
    actionsTaken: 'Reported to lead',
    status: 'New'
  });

  assert.equal(addResult.ok, true);

  const allIncidents = listIncidents(dir, {});
  assert.equal(allIncidents.length, 1);

  const filtered = listIncidents(dir, { severity: 'High' });
  assert.equal(filtered.length, 1);

  const none = listIncidents(dir, { severity: 'Low' });
  assert.equal(none.length, 0);
});
