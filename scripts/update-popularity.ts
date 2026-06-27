import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchOpenRouterRankings, normalizeScores } from './fetch-openrouter.js';
import { matchToolToScore } from './tool-model-mapping.js';
import { fetchSearchScores, normalizeSearchScores } from './fetch-trends.js';
import { fetchGitHubStars, normalizeGitHubStars } from './fetch-github.js';

const DATA_PATH = join(import.meta.dirname, '..', 'src', 'data', 'popularity.json');

interface ToolPopularityData {
  apiCalls: number;
  apiCallsRank: number;
  searchScore: number;
  searchRank: number;
  communityScore: number;
  communityRank: number;
  isFree: boolean;
}

interface PopularityData {
  updatedAt: string;
  tools: Record<string, ToolPopularityData>;
}

function calculateRanks(data: PopularityData): void {
  const slugs = Object.keys(data.tools);

  const apiSorted = [...slugs].sort(
    (a, b) => data.tools[b].apiCalls - data.tools[a].apiCalls,
  );
  apiSorted.forEach((slug, i) => {
    data.tools[slug].apiCallsRank = i + 1;
  });

  const searchSorted = [...slugs].sort(
    (a, b) => data.tools[b].searchScore - data.tools[a].searchScore,
  );
  searchSorted.forEach((slug, i) => {
    data.tools[slug].searchRank = i + 1;
  });

  const communitySorted = [...slugs].sort(
    (a, b) => data.tools[b].communityScore - data.tools[a].communityScore,
  );
  communitySorted.forEach((slug, i) => {
    data.tools[slug].communityRank = i + 1;
  });
}

async function updateApiCalls(data: PopularityData): Promise<void> {
  const rawUsage = await fetchOpenRouterRankings();
  const normalizedScores = normalizeScores(rawUsage);

  console.log(`Fetched ${rawUsage.size} models from OpenRouter`);

  for (const slug of Object.keys(data.tools)) {
    const score = matchToolToScore(slug, normalizedScores);
    if (score > 0) {
      data.tools[slug].apiCalls = score;
    }
  }
}

function updateSearchScores(data: PopularityData): void {
  const rawScores = fetchSearchScores();
  const normalizedScores = normalizeSearchScores(rawScores);

  console.log(`Normalized ${normalizedScores.size} search scores`);

  for (const slug of Object.keys(data.tools)) {
    data.tools[slug].searchScore = normalizedScores.get(slug) ?? 0;
  }
}

async function updateCommunityScores(data: PopularityData): Promise<void> {
  const rawStars = await fetchGitHubStars();
  const normalizedStars = normalizeGitHubStars(rawStars);

  console.log(`Normalized ${normalizedStars.size} GitHub star scores`);

  for (const slug of Object.keys(data.tools)) {
    data.tools[slug].communityScore = normalizedStars.get(slug) ?? 0;
  }
}

async function main() {
  console.log('Updating popularity data...');

  const raw = readFileSync(DATA_PATH, 'utf-8');
  const data: PopularityData = JSON.parse(raw);

  const toolCount = Object.keys(data.tools).length;
  console.log(`Loaded ${toolCount} tools`);

  await updateApiCalls(data);
  updateSearchScores(data);
  await updateCommunityScores(data);
  calculateRanks(data);

  data.updatedAt = new Date().toISOString();

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Written updated data to ${DATA_PATH}`);
}

main().catch((err) => {
  console.error('update-popularity failed:', err);
  process.exit(1);
});
