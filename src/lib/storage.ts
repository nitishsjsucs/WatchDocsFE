import { WatchItem } from '@/types';

const STORAGE_KEY = 'watchdocs:watches';

export function getWatches(): WatchItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWatches(watches: WatchItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watches));
  } catch (error) {
    console.error('Failed to save watches:', error);
  }
}

export function addWatch(watch: WatchItem): void {
  const watches = getWatches();
  watches.unshift(watch); // Add to beginning
  saveWatches(watches);
}

export function updateWatch(id: string, updates: Partial<WatchItem>): void {
  const watches = getWatches();
  const index = watches.findIndex(w => w.id === id);
  if (index !== -1) {
    watches[index] = { ...watches[index], ...updates };
    saveWatches(watches);
  }
}

export function deleteWatch(id: string): void {
  const watches = getWatches();
  const filtered = watches.filter(w => w.id !== id);
  saveWatches(filtered);
}
