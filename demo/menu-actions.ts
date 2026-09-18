import type { CustomMenuAction, MenuAction } from '../src/core/types';

const labels: Record<string, [string, string]> = {
  en: ['Compare products', 'Analyze delivery'],
  es: ['Comparar productos', 'Analizar entregas'],
  fr: ['Comparer les produits', 'Analyser les livraisons'],
  de: ['Produkte vergleichen', 'Lieferungen analysieren'],
  pt: ['Comparar produtos', 'Analisar entregas'],
  it: ['Confronta prodotti', 'Analizza le consegne'],
  nl: ['Producten vergelijken', 'Leveringen analyseren'],
  pl: ['Porównaj produkty', 'Przeanalizuj realizację'],
  uk: ['Порівняти товари', 'Проаналізувати виконання'],
  ru: ['Сравнить товары', 'Проанализировать результаты'],
  tr: ['Ürünleri karşılaştır', 'Teslimatları analiz et'],
  ar: ['مقارنة المنتجات', 'تحليل التسليم'],
  hi: ['उत्पादों की तुलना करें', 'डिलीवरी का विश्लेषण करें'],
  zh: ['比较产品', '分析交付结果'],
  ja: ['製品を比較', '納品実績を分析'],
  ko: ['제품 비교', '완료 실적 분석'],
};

const translations = (index: number) =>
  Object.fromEntries(
    Object.entries(labels).map(([locale, words]) => [locale, { label: words[index]! }]),
  );
const route = (url: string) => new URL(url).hash.slice(1).split('?')[0] || '/';

export const compareAction: CustomMenuAction = {
  id: 'compare-products',
  label: 'Compare products',
  prompt:
    'Use the compare_products tool to compare Luma 27 and Luma 32 Pro for a small desk. Open the comparison and explain the price difference.',
  translations: translations(0),
  requires: ['tools', 'navigation'],
  visible: ({ url }) => route(url).startsWith('/shop') || route(url) === '/compare',
};

export const projectMenu: readonly MenuAction[] = [
  compareAction,
  {
    id: 'analyze-delivery',
    label: 'Analyze delivery',
    prompt:
      'Use the get_delivery_report tool to analyze our current delivery report filters. Compare the segments and cite the evidence.',
    translations: translations(1),
    requires: ['tools'],
    visible: ({ url }) => route(url) === '/reports',
  },
  'tour',
  'pick',
  'page',
];
