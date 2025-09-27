export type WatchItem = {
  id: string;
  url: string;
  createdAt: string; // ISO
  lastCheckedAt?: string; // ISO
  notes?: string;
};

export type PreviewStatus = 'loading' | 'valid' | 'invalid' | 'blocked' | 'error';
