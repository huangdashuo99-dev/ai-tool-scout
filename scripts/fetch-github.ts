export const TOOL_GITHUB_MAP: Record<string, string> = {
  'stable-diffusion': 'Stability-AI/stablediffusion',
  'codeium': 'Exafunction/codeium.vim',
  'cursor': 'getcursor/cursor',
  'replit-ai': 'replit/replit',
  'cody': 'sourcegraph/cody',
  'tabnine': 'codota/tabnine-vscode',
  'chatglm': 'THUDM/ChatGLM-6B',
  'midjourney': '',
  'chatgpt': '',
  'claude': '',
  'gemini': '',
  'deepseek': '',
  'perplexity': '',
  'doubao': '',
  'kimi': '',
  'yuanbao': '',
  'baichuan': '',
  'xinghuo': '',
  'ernie-bot': '',
  'tongyi-qianwen': '',
  'dalle': '',
  'adobe-firefly': '',
  'leonardo-ai': '',
  'ideogram': '',
  'magnific-ai': '',
  'runway': '',
  'pika': '',
  'luma-ai': '',
  'heygen': '',
  'synthesia': '',
  'capcut': '',
  'pictory': '',
  'elevenlabs': '',
  'play-ht': '',
  'murf-ai': '',
  'descript': '',
  'otter-ai': '',
  'fireflies-ai': '',
  'notion-ai': '',
  'notion-ai-enhanced': '',
  'canva-ai': '',
  'framer-ai': '',
  'figma-ai': '',
  'gamma': '',
  'tome': '',
  'jasper': '',
  'jasper-enhanced': '',
  'copy-ai': '',
  'copy-ai-workflows': '',
  'writesonic': '',
  'rytr': '',
  'grammarly-ai': '',
  'quillbot': '',
  'surfer-seo': '',
  'uizard': '',
  'mem': '',
  'amazon-q': '',
  'd-id': '',
  'github-copilot': '',
};

export async function fetchGitHubStars(): Promise<Map<string, number>> {
  const starsMap = new Map<string, number>();

  for (const [toolSlug, repo] of Object.entries(TOOL_GITHUB_MAP)) {
    if (!repo) {
      starsMap.set(toolSlug, 0);
      continue;
    }

    try {
      const url = `https://api.github.com/repos/${repo}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ai-tool-scout',
        },
      });

      if (!response.ok) {
        console.warn(`GitHub API error for ${repo}: ${response.status} ${response.statusText}`);
        starsMap.set(toolSlug, 0);
        continue;
      }

      const data = await response.json();
      starsMap.set(toolSlug, data.stargazers_count || 0);
    } catch (error) {
      console.warn(`Failed to fetch GitHub stars for ${repo}:`, error);
      starsMap.set(toolSlug, 0);
    }
  }

  console.log(`Fetched GitHub stars for ${starsMap.size} tools`);
  return starsMap;
}

export function normalizeGitHubStars(starsMap: Map<string, number>): Map<string, number> {
  const normalized = new Map<string, number>();

  if (starsMap.size === 0) return normalized;

  const values = Array.from(starsMap.values());
  const max = Math.max(...values);

  if (max === 0) return normalized;

  for (const [key, value] of starsMap) {
    normalized.set(key, Math.round((value / max) * 100));
  }

  return normalized;
}
