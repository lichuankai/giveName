import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  NAME_COUNT_OPTIONS,
  SCENE_OPTIONS,
  STYLE_OPTIONS,
  type SceneId,
  type StyleId,
} from "./constants";
import { callDeepSeekChat } from "./lib/callDeepSeek";
import { NAME_SYSTEM_PROMPT } from "./prompts";
import "./App.css";

function buildUserPrompt(params: {
  sceneLabel: string;
  styleLabels: string[];
  count: number;
  surname: string;
  extra: string;
}): string {
  const surnameLine = params.surname.trim()
    ? `姓氏 / 前缀：${params.surname.trim()}（人名场景请给出含姓全名或明确写法）`
    : "姓氏 / 前缀：未指定";
  const styleLine =
    params.styleLabels.length > 0
      ? `风格（可多选）：${params.styleLabels.join("、")}`
      : "风格：未指定，请结合场景自行搭配一种主风格";
  const extra = params.extra.trim() ? `补充说明：${params.extra.trim()}` : "补充说明：无";
  return `场景：${params.sceneLabel}
${styleLine}
生成数量：${params.count} 个方案（须与「推荐方案」下三级标题数量一致）
${surnameLine}
${extra}

请严格按系统要求的 Markdown 结构输出；每个方案必须含寓意解释、适用场景、气质标签，并避免烂大街重名。`;
}

export default function App() {
  const [sceneId, setSceneId] = useState<SceneId>("baby-boy");
  const [selectedStyles, setSelectedStyles] = useState<Set<StyleId>>(() => new Set(["classic"]));
  const [count, setCount] = useState<(typeof NAME_COUNT_OPTIONS)[number]>(5);
  const [surname, setSurname] = useState("");
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sceneLabel = useMemo(
    () => SCENE_OPTIONS.find((o) => o.id === sceneId)?.label ?? sceneId,
    [sceneId],
  );

  const styleLabels = useMemo(
    () => STYLE_OPTIONS.filter((o) => selectedStyles.has(o.id)).map((o) => o.label),
    [selectedStyles],
  );

  const toggleStyle = (id: StyleId) => {
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onGenerate = async () => {
    setError(null);
    setResult("");
    setLoading(true);
    try {
      const text = await callDeepSeekChat(
        NAME_SYSTEM_PROMPT,
        buildUserPrompt({ sceneLabel, styleLabels, count, surname, extra }),
      );
      setResult(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gn-app">
      <header className="gn-hero">
        <div className="gn-hero-top">
          <a className="gn-back" href="/">
            ← 返回门户
          </a>
        </div>
        <h1 className="gn-title">AI 万能起名器</h1>
        <p className="gn-sub">
          按场景与风格生成有辨识度的好名：寓意解释、适用场景、气质标签一应俱全；拒绝烂大街重名，好念好记好读写。
        </p>
      </header>

      <main className="gn-card">
        <section className="gn-section">
          <h2>起名场景</h2>
          <p className="gn-hint">单选，决定名字的用途与语感边界。</p>
          <div className="gn-chips" role="radiogroup" aria-label="起名场景">
            {SCENE_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={sceneId === o.id}
                className={`gn-chip ${sceneId === o.id ? "gn-chip--on" : ""}`}
                onClick={() => setSceneId(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>

        <section className="gn-section">
          <h2>风格偏好</h2>
          <p className="gn-hint">可多选，模型会融合你的偏好。</p>
          <div className="gn-chips">
            {STYLE_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`gn-chip ${selectedStyles.has(o.id) ? "gn-chip--on" : ""}`}
                onClick={() => toggleStyle(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>

        <section className="gn-section">
          <h2>生成数量</h2>
          <div className="gn-segmented" role="group" aria-label="生成数量">
            {NAME_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`gn-seg-btn ${count === n ? "gn-seg-btn--on" : ""}`}
                onClick={() => setCount(n)}
              >
                {n} 个
              </button>
            ))}
          </div>
        </section>

        <section className="gn-section">
          <h2>姓氏 / 前缀（可选）</h2>
          <p className="gn-hint">宝宝、笔名等人名场景可填姓；品牌场景可填想保留的字或音节。</p>
          <input
            className="gn-input"
            type="text"
            maxLength={8}
            placeholder="例如：林、云、小"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </section>

        <section className="gn-section">
          <h2>补充说明（可选）</h2>
          <textarea
            className="gn-textarea"
            rows={4}
            placeholder="例如：希望带「水」意、避免多音字、偏二字名、不要网红感…"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </section>

        <div className="gn-actions">
          <button type="button" className="gn-btn gn-btn-primary" disabled={loading} onClick={onGenerate}>
            {loading ? "正在起名…" : "生成起名方案"}
          </button>
        </div>

        {error && (
          <div className="gn-alert" role="alert">
            <strong>出错了：</strong>
            {error}
            <p className="gn-alert-detail">
              开发环境请在项目根或 <code>giveName/.env.local</code> 配置 <code>DEEPSEEK_API_KEY</code>，并执行{" "}
              <code>npm run dev</code>。
            </p>
          </div>
        )}

        {result && (
          <section className="gn-result">
            <h2 className="gn-result-title">起名方案</h2>
            <article className="gn-markdown">
              <ReactMarkdown>{result}</ReactMarkdown>
            </article>
          </section>
        )}
      </main>

      <footer className="gn-footer">
        <small>Powered by DeepSeek · 起名仅供参考，正式使用请自行查重与合规核验。</small>
      </footer>
    </div>
  );
}
