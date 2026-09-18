import { localeChain } from '../../src/core/locale';
import type { ReportView } from '../report-store';
import { analyzeDelivery } from '../analytics';

const labels: Record<string, [string, string, string, string, string]> = {
  en: [
    'Current view',
    'Six weeks',
    'Latest three weeks',
    'All disciplines',
    'Full studio comparison',
  ],
  ru: [
    'Текущий вид',
    'Шесть недель',
    'Последние три недели',
    'Все направления',
    'Сравнение всей студии',
  ],
  fr: [
    'Vue actuelle',
    'Six semaines',
    'Trois dernières semaines',
    'Toutes les disciplines',
    'Comparaison du studio entier',
  ],
  es: [
    'Vista actual',
    'Seis semanas',
    'Últimas tres semanas',
    'Todas las disciplinas',
    'Comparación de todo el estudio',
  ],
  de: [
    'Aktuelle Ansicht',
    'Sechs Wochen',
    'Letzte drei Wochen',
    'Alle Disziplinen',
    'Vergleich des gesamten Studios',
  ],
  pt: [
    'Vista atual',
    'Seis semanas',
    'Últimas três semanas',
    'Todas as áreas',
    'Comparação de todo o estúdio',
  ],
  it: [
    'Vista attuale',
    'Sei settimane',
    'Ultime tre settimane',
    'Tutte le discipline',
    'Confronto dell’intero studio',
  ],
  nl: [
    'Huidige weergave',
    'Zes weken',
    'Laatste drie weken',
    'Alle disciplines',
    'Vergelijking van de hele studio',
  ],
  pl: [
    'Bieżący widok',
    'Sześć tygodni',
    'Ostatnie trzy tygodnie',
    'Wszystkie dziedziny',
    'Porównanie całego studia',
  ],
  uk: [
    'Поточний вигляд',
    'Шість тижнів',
    'Останні три тижні',
    'Усі напрями',
    'Порівняння всієї студії',
  ],
  tr: [
    'Geçerli görünüm',
    'Altı hafta',
    'Son üç hafta',
    'Tüm disiplinler',
    'Tüm stüdyo karşılaştırması',
  ],
  ar: [
    'العرض الحالي',
    'ستة أسابيع',
    'الأسابيع الثلاثة الأخيرة',
    'جميع التخصصات',
    'مقارنة الاستوديو بالكامل',
  ],
  hi: ['वर्तमान दृश्य', 'छह सप्ताह', 'पिछले तीन सप्ताह', 'सभी विभाग', 'पूरे स्टूडियो की तुलना'],
  zh: ['当前视图', '六周', '最近三周', '所有领域', '整个工作室的比较'],
  ja: ['現在の表示', '6週間', '直近3週間', 'すべての部門', 'スタジオ全体の比較'],
  ko: ['현재 보기', '6주', '최근 3주', '모든 분야', '전체 스튜디오 비교'],
};

export function reportViewCopy(view: ReportView, locale: string): string {
  const copy =
    localeChain(locale)
      .map((code) => labels[code])
      .find(Boolean) ?? labels.en!;
  const report = analyzeDelivery();
  const segment = report.segments.find((item) => item.id === view.segment);
  const weeks = view.period === 'recent' ? report.weeks.slice(3) : report.weeks;
  const number = new Intl.NumberFormat(locale);
  return `**${copy[0]}: ${copy[view.period === 'recent' ? 2 : 1]} · ${segment?.name ?? copy[3]}**\n\n${weeks.map((week) => `${week.label}: ${week.delivered}/${week.planned}`).join(' · ')}\n\n${segment ? `${segment.name}: **${segment.previous} → ${segment.current} (+${number.format(segment.changePercent)}%)**.\n\n` : ''}**${copy[4]}**\n\n`;
}
