import { readFileSync } from 'fs';
import { join } from 'path';

export function fetchSearchScores(): Map<string, number> {
  const scores = new Map<string, number>();
  const data = JSON.parse(readFileSync(join(import.meta.dirname, 'search-scores.json'), 'utf-8'));
  for (const [key, value] of Object.entries(data)) {
    scores.set(key, value as number);
  }
  return scores;
}

export function normalizeSearchScores(scores: Map<string, number>): Map<string, number> {
  const values = Array.from(scores.values());
  if (values.length === 0) return new Map();
  const max = Math.max(...values);
  if (max === 0) return new Map();
  const normalized = new Map<string, number>();
  for (const [key, value] of scores) {
    normalized.set(key, Math.round((value / max) * 100));
  }
  return normalized;
}
