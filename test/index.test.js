import test from 'node:test';
import assert from 'node:assert/strict';
import { HistoryEngine, OTTO_ENGINE } from '../src/index.js';

test('engine metadata is initialized', () => {
  assert.equal(OTTO_ENGINE.name.startsWith('otto'), true);
  assert.equal(OTTO_ENGINE.sandboxed, true);
  assert.equal(OTTO_ENGINE.auditable, true);
});

test('history snapshots support rollback without corrupting later states', () => {
  const history = new HistoryEngine({
    files: { 'README.md': 'A' },
    graph: { nodes: ['n1'] },
    permissions: { read: true },
    settings: { theme: 'dark' }
  });

  const stateB = history.applyState('state-b', {
    files: { 'README.md': 'B' },
    graph: { nodes: ['n1', 'n2'] },
    permissions: { read: true, write: true },
    settings: { theme: 'light' }
  });

  const stateC = history.applyState('state-c', {
    files: { 'README.md': 'C' },
    graph: { nodes: ['n1', 'n2', 'n3'] },
    permissions: { read: true, write: true, delete: true },
    settings: { theme: 'solarized' }
  });

  const restored = history.rollbackTo(stateB.label);
  assert.equal(restored.files['README.md'], 'B');
  assert.deepEqual(restored.graph.nodes, ['n1', 'n2']);

  const snapshotC = history.snapshots.get(stateC.id);
  assert.ok(snapshotC);
  assert.equal(snapshotC.state.files['README.md'], 'C');

  const timeline = history.getTimeline();
  assert.ok(timeline.some((entry) => entry.type === 'restore'));
});
