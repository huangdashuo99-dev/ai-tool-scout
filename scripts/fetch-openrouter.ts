import type { OpenRouterRankingsResponse } from './types.js';

export async function fetchOpenRouterRankings(): Promise<Map<string, number>> {
  const usageMap = new Map<string, number>();

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set, skipping OpenRouter fetch');
      return usageMap;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const url = `https://openrouter.ai/api/v1/datasets/rankings-daily?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      console.error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      return usageMap;
    }

    const data: OpenRouterRankingsResponse = await response.json();

    // data.data is an array of daily ranking entries
    for (const entry of data.data) {
      const permaSlug = entry.model_permaslug;
      const tokens = entry.total_tokens || 0;
      usageMap.set(permaSlug, (usageMap.get(permaSlug) || 0) + tokens);
    }

    console.log(`Fetched ${usageMap.size} models from OpenRouter`);
  } catch (error) {
    console.error('Failed to fetch OpenRouter rankings:', error);
  }

  return usageMap;
}

export function normalizeScores(usageMap: Map<string, number>): Map<string, number> {
  const normalized = new Map<string, number>();

  if (usageMap.size === 0) return normalized;

  const values = Array.from(usageMap.values());
  const max = Math.max(...values);

  if (max === 0) return normalized;

  for (const [key, value] of usageMap) {
    normalized.set(key, Math.round((value / max) * 100));
  }

  return normalized;
}
