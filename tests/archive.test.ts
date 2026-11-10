import test from "node:test";
import assert from "node:assert/strict";
import { detectLanguage, normalizeSearch, indexPosts, filterAndSort, validatePosts, formatDate, type Post } from "../archive.ts";

const make = (id: number, title: string, content: string, date = "2026-01-01"): Post => ({ id, title, content, date, author: "Analyst", files: ["EFTA123.pdf"] });
const posts = [
  make(1, "Zebra case", "The case and the documents are not the same.", "2026-01-01"),
  make(2, "İstanbul analizi", "Bu bir vaka analizi ve raporu. Bir kayıt için bu bilgiler var.", "2026-02-01"),
  make(3, "Analyse av Norge", "Denne analysen er basert på det som er dokumentert, og ikke på rykter.", "2026-03-01"),
  make(4, "Анализ дела", "Этот анализ рассматривает документы и переписку. Сведения основаны на документах.", "2026-04-01"),
];

test("classifies the four archive languages and retains an unknown category", () => {
  assert.deepEqual(posts.map(detectLanguage), ["en", "tr", "nb", "ru"]);
  assert.equal(detectLanguage(make(5, "123", "")), "unknown");
});
test("search is case and diacritic insensitive, including Turkish and Norwegian", () => {
  assert.equal(normalizeSearch("İSTANBUL ışıK RØD Æ Ø Å"), "istanbul isik rod ae o a");
  const indexed = indexPosts(posts);
  assert.deepEqual(filterAndSort(indexed, "ISTANBUL kayıt", "all", "newest").map(x => x.post.id), [2]);
  assert.equal(filterAndSort(indexed, "EFTA123", "all", "newest").length, 4);
  assert.equal(filterAndSort(indexed, "no-such-term", "all", "newest").length, 0);
});
test("filtering and sorting compose without mutating source records", () => {
  const indexed = indexPosts(posts), copy = JSON.stringify(posts);
  assert.deepEqual(filterAndSort(indexed, "", "tr", "az").map(x => x.post.id), [2]);
  assert.deepEqual(filterAndSort(indexed, "", "all", "newest").map(x => x.post.id), [4, 3, 2, 1]);
  assert.deepEqual(filterAndSort(indexed, "", "all", "oldest").map(x => x.post.id), [1, 2, 3, 4]);
  const asc = filterAndSort(indexed, "", "all", "az").map(x => x.post.id);
  assert.deepEqual(filterAndSort(indexed, "", "all", "za").map(x => x.post.id), [...asc].reverse());
  assert.deepEqual(filterAndSort(indexed, "", "all", "language").map(x => x.language), ["en", "nb", "ru", "tr"]);
  assert.equal(JSON.stringify(posts), copy);
});
test("input validation rejects malformed responses and duplicate ids, not text punctuation", () => {
  assert.throws(() => validatePosts({ records: [] }));
  assert.throws(() => validatePosts([posts[0], posts[0]]));
  assert.throws(() => validatePosts([{ ...posts[0], id: "bad" }]));
  const payload = '<img src=x onerror="alert(1)">';
  assert.equal(validatePosts([{ ...posts[0], content: payload }])[0].content, payload);
  assert.deepEqual(validatePosts([{ ...posts[0], files: ["evidence.pdf", 3, null] }])[0].files, ["evidence.pdf"]);
  assert.equal(formatDate("invalid"), "Date not provided");
  assert.equal(formatDate(""), "Date not provided");
});
