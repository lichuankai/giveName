export function deepseekChatCompletionsUrl(): string {
  const proxyOrigin = import.meta.env.VITE_API_PROXY_URL?.trim();
  if (proxyOrigin) {
    const root = proxyOrigin.replace(/\/+$/, "");
    return `${root}/api/deepseek/chat/completions`;
  }

  const raw = import.meta.env.BASE_URL ?? "/";
  const base = raw.endsWith("/") && raw.length > 1 ? raw.slice(0, -1) : raw.replace(/\/$/, "");
  return `${base}/api/deepseek/chat/completions`;
}
