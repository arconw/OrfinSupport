import { createTextRetriever } from '../src/core/retrieval';
import type { Retriever, Source } from '../src/core/types';
import { knowledge } from './data';
import { products } from './catalog';
import { analyzeDelivery } from './analytics';

const workspace = createTextRetriever(knowledge);
const report: Source = {
  id: 'delivery-ledger',
  title: 'Studio delivery ledger',
  content: analyzeDelivery().interpretation,
  url: '#/reports',
};
const catalog: Source[] = products.map((product) => ({
  id: product.id,
  title: `${product.name} specifications & reviews`,
  content: JSON.stringify(product),
  url: `#/shop/${product.id}`,
}));

export const demoRetriever: Retriever = {
  async retrieve(query, context) {
    const text = query.toLowerCase();
    if (
      /luma|monitor|display|review|cart|equipment|монитор|товар|отзыв|корзин|каталог/.test(text)
    ) {
      const matched = catalog.filter(
        (source) => text.includes(source.id.replace(/-/g, ' ')) || text.includes(source.id),
      );
      return matched.length ? matched : catalog.slice(0, 2);
    }
    if (
      /analy|report|brand.*web|web.*brand|delivery.*(?:trend|result)|анализ|отч[её]т|тенденц|DL-04[12]/i.test(
        text,
      )
    )
      return [report];
    return workspace.retrieve(query, context);
  },
};
