export type Language = "en" | "nb" | "tr" | "ru" | "unknown";
export type SortOrder = "newest" | "oldest" | "az" | "za" | "language";
export interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  date: string;
  files: string[];
}
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "nb", label: "Norsk" },
  { code: "tr", label: "Türkçe" },
  { code: "ru", label: "Русский" },
  { code: "unknown", label: "Other / undetermined" },
];

export function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ø/g, "o")
    .replace(/æ/g, "ae").normalize("NFD").replace(/\p{M}/gu, "");
}

// Display metadata only. Never translates, replaces or writes record content.
export function detectLanguage(post: Pick<Post, "title" | "content">): Language {
  const sample = `${post.title}\n${post.content.slice(0, 1800)}`;
  if ((sample.match(/[А-Яа-яЁё]/g) ?? []).length > 30) return "ru";
  const text = sample.toLowerCase();
  const scores = {
    tr: (text.match(/\b(?:ve|bir|bu|ile|için|olarak|ancak|olan|kadar|analizi|vaka|raporu|değil)\b/gu) ?? []).length + (sample.match(/[ıİğĞşŞ]/g) ?? []).length,
    nb: (text.match(/\b(?:og|er|som|ikke|til|med|av|denne|det|fra|eller|dette|kronprinsessen|saksanalyse)\b/gu) ?? []).length + (sample.match(/[æøÆØ]/g) ?? []).length,
    en: (text.match(/\b(?:the|and|is|this|that|from|with|of|not|which|for|was|case|analysis)\b/gu) ?? []).length,
  };
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return ranked[0][1] >= 3 && ranked[0][1] > ranked[1][1] ? ranked[0][0] as Language : "unknown";
}

export function indexPosts(posts: Post[]) {
  return posts.map(post => ({
    post,
    language: detectLanguage(post),
    search: normalizeSearch(`${post.id}\n${post.title}\n${post.author}\n${post.content}\n${post.files.join(" ")}`),
  }));
}

export function filterAndSort(
  indexed: ReturnType<typeof indexPosts>, query: string, language: string, order: SortOrder,
) {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const locale = language === "all" || language === "unknown" ? "en" : language;
  const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
  const time = (value: string) => Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;
  return indexed.filter(item => (language === "all" || item.language === language)
    && terms.every(term => item.search.includes(term)))
    .sort((a, b) => {
      const titleOrder = collator.compare(a.post.title, b.post.title) || a.post.id - b.post.id;
      if (order === "az") return titleOrder;
      if (order === "za") return -titleOrder;
      if (order === "language") return collator.compare(a.language, b.language) || titleOrder;
      const chronological = time(b.post.date) - time(a.post.date) || b.post.id - a.post.id;
      return order === "oldest" ? -chronological : chronological;
    });
}

export function previewText(text: string, max = 240) {
  const clean = (value: string) => value.replace(/https?:\/\/\S+/g, " ").replace(/[#*_`>|]/g, " ").replace(/\s+/g, " ").trim();
  // Excerpts may omit repeated report headers; the detail view always keeps the complete text.
  const reportHeader = /^(?:CASE ANALYSIS|SAKSANALYSE|VAKA ANALİZİ|АНАЛИЗ (?:ДЕЛА|СЛУЧАЯ|КЕЙСА)|REPORT CODE|RAPPORTKODE|RAPOR KODU|КОД ОТЧЕТА|Tittel:|Title:|Başlık:|Заголовок:|ANALYSIS TYPE|ANALYSETYPE|ANALİZ TÜRÜ|ТИП АНАЛИЗА|ID:|DATE:|DATO:|TARİH:|ДАТА:|ANALYST:|ANALYTIKER:|ANALİST:)/iu;
  const paragraphs = text.split(/\n\s*\n/).map(clean);
  const plain = paragraphs.find(value => value.length >= 120 && !reportHeader.test(value)) ?? clean(text);
  return plain.length <= max ? plain : `${plain.slice(0, max).trimEnd()}…`;
}

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not provided" : date.toISOString().slice(0, 10);
}

export function validatePosts(data: unknown): Post[] {
  if (!Array.isArray(data)) throw new Error("Invalid archive response");
  const ids = new Set<number>();
  return data.map(row => {
    if (!row || !Number.isSafeInteger(Number(row.id)) || Number(row.id) < 0
      || typeof row.title !== "string" || typeof row.content !== "string" || ids.has(Number(row.id))) {
      throw new Error("Invalid archive record");
    }
    ids.add(Number(row.id));
    return {
      id: Number(row.id), title: row.title, content: row.content,
      author: typeof row.author === "string" ? row.author : "NorthByte Analyst",
      date: typeof row.date === "string" ? row.date : "",
      files: Array.isArray(row.files) ? row.files.filter((file: unknown) => typeof file === "string") : [],
    };
  });
}
