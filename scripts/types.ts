export interface OpenRouterRankingEntry {
  model_permaslug: string;
  total_tokens: number;
  [key: string]: unknown;
}

export interface OpenRouterRankingsResponse {
  data: OpenRouterRankingEntry[];
  [key: string]: unknown;
}
