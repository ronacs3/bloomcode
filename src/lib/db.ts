import Dexie, { type EntityTable } from 'dexie';

export interface SavedGameRecord {
  id: string;
  updatedAt: number;
  day: number;
  data: string; // JSON stringified state
}

class BloomCodeDatabase extends Dexie {
  saves!: EntityTable<SavedGameRecord, 'id'>;

  constructor() {
    super('BloomCodeDB');
    this.version(1).stores({
      saves: 'id, updatedAt, day',
    });
  }
}

export const db = new BloomCodeDatabase();

export async function saveGameToIndexedDB(state: unknown, day: number) {
  try {
    await db.saves.put({
      id: 'current_save',
      updatedAt: Date.now(),
      day,
      data: JSON.stringify(state),
    });
  } catch (err) {
    console.error('Dexie IndexedDB save error:', err);
  }
}

export async function loadGameFromIndexedDB(): Promise<unknown | null> {
  try {
    const record = await db.saves.get('current_save');
    if (record?.data) {
      return JSON.parse(record.data);
    }
  } catch (err) {
    console.error('Dexie IndexedDB load error:', err);
  }
  return null;
}
