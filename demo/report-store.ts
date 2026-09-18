import type { ChatRequest } from '../src/core/types';

export interface ReportView {
  period: 'all' | 'recent';
  segment: 'all' | 'brand' | 'web';
}

export const defaultReportView: ReportView = { period: 'all', segment: 'all' };

export function validReportView(value: unknown): value is ReportView {
  if (!value || typeof value !== 'object') return false;
  const view = value as ReportView;
  return ['all', 'recent'].includes(view.period) && ['all', 'brand', 'web'].includes(view.segment);
}

export function reportViewFromRequest(request: ChatRequest): ReportView {
  const description = request.page.sections.find(
    (section) => section.id === 'delivery-chart',
  )?.description;
  const match = /\[report-view:(all|recent),segment:(all|brand|web)\]/.exec(description ?? '');
  return match
    ? { period: match[1] as ReportView['period'], segment: match[2] as ReportView['segment'] }
    : defaultReportView;
}

export class DemoReportStore {
  private view: ReportView = defaultReportView;
  private listeners = new Set<() => void>();
  get = () => this.view;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  set = (view: ReportView) => {
    if (!validReportView(view)) throw new Error('Invalid report view.');
    this.view = { ...view };
    this.listeners.forEach((listener) => listener());
  };
  context = (request: ChatRequest): ChatRequest => ({
    ...request,
    page: {
      ...request.page,
      sections: request.page.sections.map((section) =>
        section.id === 'delivery-chart'
          ? {
              ...section,
              description: `${section.description} Current visible chart: ${this.view.period === 'recent' ? 'latest three weeks' : 'six weeks'}. Current segment table: ${this.view.segment}. When answering about the current view, use these filters. [report-view:${this.view.period},segment:${this.view.segment}]`,
            }
          : section,
      ),
    },
  });
}
