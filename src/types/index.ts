export type LatestScan = {
  id: number;
  changes: boolean;
  change_level: string;
  change_summary: string;
  current_summary: string;
  scan_date: string;
};

export type WatchItem = {
  id: number;
  title: string;
  desc: string;
  url: string;
  status: string;
  created_date: string;
  latest_scan: LatestScan;
};

export type DocumentsResponse = {
  documents: WatchItem[];
  total_count: number;
};

export type PreviewStatus = 'loading' | 'valid' | 'invalid' | 'blocked' | 'error';
