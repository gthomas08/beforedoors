export type ResearchResult = {
  question: string;
  answer: string;
  url: string;
};

export function deduplicateResearchResults(results: ResearchResult[]) {
  const seen = new Set<string>();
  const unique: ResearchResult[] = [];

  for (const result of results) {
    const key = `${normalizeResearchText(result.question)}\n${normalizeResearchText(result.answer)}`;
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(result);
  }

  return unique;
}

export function researchResultKey(result: ResearchResult) {
  return `${normalizeResearchText(result.question)}\n${normalizeResearchText(result.answer)}`;
}

function normalizeResearchText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
