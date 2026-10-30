const deepClone = (value) => JSON.parse(JSON.stringify(value));

export class HistoryEngine {
  constructor(initialState = {}) {
    this.snapshots = new Map();
    this.timeline = [];
    this.currentState = deepClone(initialState);
    this.snapshot('initial-state', this.currentState);
  }

  snapshot(label, state = this.currentState) {
    const entry = {
      id: `snapshot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      label,
      createdAt: new Date().toISOString(),
      state: deepClone(state)
    };
    this.snapshots.set(entry.id, entry);
    this.timeline.push({ type: 'snapshot', id: entry.id, label, createdAt: entry.createdAt });
    return entry;
  }

  getCurrentState() {
    return deepClone(this.currentState);
  }

  listSnapshots() {
    return Array.from(this.snapshots.values()).map((snapshot) => ({
      ...snapshot,
      state: deepClone(snapshot.state)
    }));
  }

  getTimeline() {
    return [...this.timeline];
  }

  restore(snapshotId) {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot '${snapshotId}' does not exist.`);
    }
    this.currentState = deepClone(snapshot.state);
    this.timeline.push({
      type: 'restore',
      snapshotId: snapshot.id,
      label: snapshot.label,
      restoredAt: new Date().toISOString()
    });
    return deepClone(this.currentState);
  }

  rollbackTo(identifier) {
    const snapshot = this.snapshots.get(identifier)
      ?? Array.from(this.snapshots.values()).find((entry) => entry.label === identifier);
    if (!snapshot) {
      throw new Error(`No snapshot matches '${identifier}'.`);
    }
    return this.restore(snapshot.id);
  }

  applyState(label, nextState) {
    const state = deepClone(nextState);
    this.currentState = state;
    return this.snapshot(label, state);
  }
}

export const OTTO_ENGINE = {
  name: 'otto-history-engine',
  version: '0.1.0',
  sandboxed: true,
  auditable: true,
  recoverable: true
};
