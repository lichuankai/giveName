import { deepseekChatCompletionsUrl } from "./apiUrl";

function looksLikeHtml(s: string): boolean {
  const t = s.trimStart().slice(0, 80).toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || t.startsWith("<head");
}

export async function callDeepSeekChat(systemPrompt: string, userContent: string): Promise<string> {
  const url = deepseekChatCompletionsUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.75,
      max_tokens: 8192,
    }),
  });

  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    const html = looksLikeHtml(raw);
    const hint404 =
      res.status === 404 || html
        ? " 请确认已配置同源 /giveName/api/deepseek 反代，或使用 npm run dev 从门户进入。"
        : "";
    throw new Error(`接口返回非 JSON（HTTP ${res.status}）。${hint404}`);
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: { message?: string } }).error?.message ?? raw)
        : raw;
    const hint401 =
      res.status === 401
        ? " 开发：在项目根或 giveName/.env.local 配置 DEEPSEEK_API_KEY 后重启 npm run dev。"
        : "";
    throw new Error((msg || `请求失败（${res.status}）`) + hint401);
  }

  const choices = (data as { choices?: { message?: { content?: string } }[] }).choices;
  const text = choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("模型未返回有效内容，请稍后重试。");
  }
  return text;
}
