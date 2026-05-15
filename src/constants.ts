export const SCENE_OPTIONS = [
  { id: "baby-boy", label: "宝宝起名 · 男孩" },
  { id: "baby-girl", label: "宝宝起名 · 女孩" },
  { id: "baby-neutral", label: "宝宝起名 · 中性" },
  { id: "brand", label: "品牌 / 产品名" },
  { id: "company", label: "公司 / 工作室" },
  { id: "shop", label: "店铺 / 餐饮" },
  { id: "pet", label: "宠物名" },
  { id: "pen", label: "笔名 / 艺名" },
  { id: "game", label: "游戏 / 小说角色" },
  { id: "project", label: "项目 / 活动代号" },
] as const;

export const STYLE_OPTIONS = [
  { id: "classic", label: "古典雅致" },
  { id: "modern", label: "现代简洁" },
  { id: "poetic", label: "诗意文艺" },
  { id: "fresh", label: "清新自然" },
  { id: "grand", label: "大气庄重" },
  { id: "cute", label: "可爱灵动" },
  { id: "cool", label: "酷飒利落" },
  { id: "international", label: "国际化好念" },
  { id: "minimal", label: "极简两字" },
  { id: "meaningful", label: "寓意优先" },
] as const;

export type SceneId = (typeof SCENE_OPTIONS)[number]["id"];
export type StyleId = (typeof STYLE_OPTIONS)[number]["id"];

export const NAME_COUNT_OPTIONS = [3, 5, 8] as const;
