import { WatchItem, DocumentsResponse } from '@/types';

const API_BASE_URL = 'http://localhost:8000';

// API service functions
export async function getWatches(): Promise<WatchItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: DocumentsResponse = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Failed to fetch watches:', error);
    return [];
  }
}

export async function addWatch(watch: { title: string; url: string; desc?: string }): Promise<WatchItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: watch.title,
        url: watch.url,
        desc: watch.desc || '',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to add watch:', error);
    return null;
  }
}

export async function deleteWatch(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to delete watch:', error);
    return false;
  }
}

export async function getWatchById(id: number): Promise<WatchItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch watch:', error);
    return null;
  }
}

// Legacy functions for compatibility - these now just return dummy data or throw errors
export function saveWatches(watches: WatchItem[]): void {
  console.warn('saveWatches is deprecated - data is now managed by the API');
}

export function updateWatch(id: string, updates: Partial<WatchItem>): void {
  console.warn('updateWatch is deprecated - use API endpoints directly');
}
