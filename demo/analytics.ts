export const deliveryReport = {
  title: 'Studio delivery report',
  period: 'Aug 10 – Sep 18, 2026',
  source: 'Northstar delivery ledger v2026.09.18',
  weeks: [
    { label: 'Aug 10', delivered: 14, planned: 20 },
    { label: 'Aug 17', delivered: 16, planned: 20 },
    { label: 'Aug 24', delivered: 18, planned: 22 },
    { label: 'Aug 31', delivered: 20, planned: 22 },
    { label: 'Sep 7', delivered: 22, planned: 24 },
    { label: 'Sep 14', delivered: 24, planned: 26 },
  ],
  segments: [
    {
      id: 'brand',
      name: 'Brand & identity',
      previous: 24,
      current: 36,
      previousLeadDays: 6,
      leadDays: 4,
      reworkPrevious: 6,
      rework: 3,
    },
    {
      id: 'web',
      name: 'Web experiences',
      previous: 24,
      current: 30,
      previousLeadDays: 8,
      leadDays: 7,
      reworkPrevious: 5,
      rework: 5,
    },
  ],
  evidence: [
    {
      id: 'DL-041',
      date: 'Aug 31',
      observation: 'Brand introduced a shared review checklist before handoff.',
      scope: 'Brand & identity',
      caveat:
        'Timing is consistent with less rework; this observational data does not prove causation.',
    },
    {
      id: 'DL-052',
      date: 'Sep 7',
      observation: 'Two web tasks waited for client feedback for three days each.',
      scope: 'Web experiences',
      caveat: 'A documented source of delay, not an explanation for every slower task.',
    },
  ],
} as const;

export function analyzeDelivery() {
  const previous = deliveryReport.weeks.slice(0, 3).reduce((sum, week) => sum + week.delivered, 0);
  const current = deliveryReport.weeks.slice(3).reduce((sum, week) => sum + week.delivered, 0);
  return {
    ...deliveryReport,
    comparison: {
      previousPeriod: 'Aug 10–30',
      currentPeriod: 'Aug 31–Sep 18',
      previous,
      current,
      change: current - previous,
      changePercent: ((current - previous) / previous) * 100,
    },
    segments: deliveryReport.segments.map((segment) => ({
      ...segment,
      changePercent: ((segment.current - segment.previous) / segment.previous) * 100,
    })),
    lastWeek: deliveryReport.weeks.at(-1),
    interpretation:
      'Delivery rose from 48 to 66 tasks (+37.5%) across equal three-week windows. Brand grew 50% (24 to 36), compared with Web at 25% (24 to 30). Brand lead time fell from 6 to 4 days and rework from 6 to 3 tasks. A shared checklist started Aug 31 (DL-041); association, not proven causation. Web lead time fell only 8 to 7 days, with two documented client-feedback delays (DL-052). Last week delivered 24 of 26 planned tasks (92.3%); the overview rounds this to 92%. Counts describe this fictional ledger, not future guarantees.',
  };
}

export const dailyDelivery = { current: [3, 5, 4, 6, 4, 1, 1], previous: [3, 4, 3, 5, 4, 2, 1] };
