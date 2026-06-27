/**
 * Maps tool slugs to OpenRouter model slug prefixes.
 * Used to match AI tools to their underlying model usage from OpenRouter data.
 *
 * OpenRouter model_permaslug format: provider/model-name-version-date
 * e.g. "openai/gpt-5.5-20260423", "deepseek/deepseek-v4-flash-20260423"
 *
 * We match by checking if the permaSlug starts with a provider/model prefix.
 */
export const TOOL_MODEL_MAP: Record<string, string[]> = {
  'chatgpt': ['openai/gpt'],
  'claude': ['anthropic/claude'],
  'gemini': ['google/gemini'],
  'deepseek': ['deepseek/deepseek'],
  'perplexity': ['perplexity/'],
  'doubao': ['bytedance/doubao'],
  'kimi': ['moonshotai/kimi', 'moonshot/kimi'],
  'yuanbao': ['tencent/hunyuan'],
  'chatglm': ['zhipu/glm'],
  'baichuan': ['baichuan/'],
  'xinghuo': ['spark/spark'],
  'ernie-bot': ['baidu/ernie'],
  'tongyi-qianwen': ['qwen/qwen', 'qwen/qwen-max', 'qwen/qwen-plus'],
  // Non-LLM tools (code editors, image/video generators, etc.) — no OpenRouter model
  'cody': [], 'cursor': [], 'replit-ai': [], 'codeium': [], 'tabnine': [], 'github-copilot': [],
  'midjourney': [], 'dalle': [], 'adobe-firefly': [], 'leonardo-ai': [], 'stable-diffusion': [], 'ideogram': [], 'magnific-ai': [],
  'runway': [], 'pika': [], 'luma-ai': [], 'heygen': [], 'synthesia': [], 'capcut': [], 'pictory': [],
  'jasper': [], 'jasper-enhanced': [], 'copy-ai': [], 'copy-ai-workflows': [], 'writesonic': [], 'rytr': [],
  'grammarly-ai': [], 'quillbot': [], 'notion-ai': [], 'notion-ai-enhanced': [], 'mem': [], 'uizard': [],
  'canva-ai': [], 'framer-ai': [], 'figma-ai': [], 'gamma': [], 'tome': [],
  'elevenlabs': [], 'play-ht': [], 'murf-ai': [], 'descript': [], 'otter-ai': [], 'fireflies-ai': [],
  'surfer-seo': [], 'amazon-q': [], 'd-id': [],
};

/**
 * Match a tool slug against OpenRouter model scores.
 * Returns the max score among all matched models, or 0 if no match.
 */
export function matchToolToScore(toolSlug: string, scoreMap: Map<string, number>): number {
  const prefixes = TOOL_MODEL_MAP[toolSlug];
  if (!prefixes || prefixes.length === 0) return 0;

  let maxScore = 0;
  for (const [permaSlug, score] of scoreMap) {
    // Skip aggregated "other" row
    if (permaSlug === 'other') continue;
    if (prefixes.some(p => permaSlug.startsWith(p))) {
      maxScore = Math.max(maxScore, score);
    }
  }
  return maxScore;
}
