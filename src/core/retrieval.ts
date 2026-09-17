import type { Retriever, Source, ToolContext } from './types';

export function createTextRetriever(documents: Source[], limit = 4): Retriever {
  return {
    async retrieve(query) {
      const terms = [...new Set(query.toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [])];
      return documents
        .map((doc) => {
          const text = `${doc.title} ${doc.content}`.toLocaleLowerCase();
          const score =
            terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0) /
            Math.max(terms.length, 1);
          return { ...doc, score };
        })
        .filter((doc) => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
  };
}

export function createVectorRetriever(options: {
  embed: (query: string, context: ToolContext) => Promise<number[]>;
  search: (vector: number[], context: ToolContext) => Promise<Source[]>;
  limit?: number;
  minScore?: number;
}): Retriever {
  return {
    async retrieve(query, context) {
      const vector = await options.embed(query, context);
      context.signal.throwIfAborted();
      const sources = await options.search(vector, context);
      return sources
        .filter((source) => (source.score ?? 1) >= (options.minScore ?? 0))
        .slice(0, options.limit ?? 4);
    },
  };
}
