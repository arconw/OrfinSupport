import { ArrowUpRight, FileText, MoveUpRight } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import type { OrfinController } from '../../src/index';
import { analyzeDelivery, deliveryReport } from '../analytics';
import { OrfinLogo } from './Brand';
import type { DemoReportStore, ReportView } from '../report-store';

export function ReportsPage({
  orfin,
  store,
}: {
  orfin: OrfinController | null;
  store: DemoReportStore;
}) {
  const selection = useSyncExternalStore(store.subscribe, store.get);
  const { period: view, segment } = selection;
  const analysis = analyzeDelivery();
  const weeks = view === 'all' ? deliveryReport.weeks : deliveryReport.weeks.slice(3);
  const segments = analysis.segments.filter((item) => segment === 'all' || item.id === segment);
  return (
    <div className="report-page">
      <div className="page-heading">
        <div>
          <h1>Good work, gaining momentum.</h1>
          <p>
            Studio delivery report <span className="report-period">{deliveryReport.period}</span>
          </p>
        </div>
        <button
          className="button report-ask"
          onClick={() =>
            void orfin?.send(
              'Analyze our delivery results for the current chart period and selected segment. Explain the trend with numbers and show the evidence. Distinguish possible causes from proven facts.',
            )
          }
        >
          <OrfinLogo size={18} /> Explain the results <ArrowUpRight size={14} />
        </button>
      </div>
      <section className="delivery-report" data-orfin-section="delivery-chart">
        <div className="report-summary">
          <div>
            <span>Delivered in the latest three weeks</span>
            <div className="report-number">
              {analysis.comparison.current}
              <small>tasks</small>
            </div>
            <p>
              <MoveUpRight size={16} /> {analysis.comparison.changePercent}% more than the previous
              three weeks
            </p>
          </div>
          <div className="report-context">
            <strong>
              {analysis.comparison.previous} → {analysis.comparison.current}
            </strong>
            <p>
              Equal three-week windows.
              <br />
              {analysis.comparison.previousPeriod} compared with {analysis.comparison.currentPeriod}
              .
            </p>
          </div>
        </div>
        <div className="chart-heading">
          <div className="chart-legend">
            <span>
              <i /> Delivered
            </span>
            <span>
              <i /> Planned
            </span>
          </div>
          <div className="segmented-control" aria-label="Chart period">
            <button
              aria-pressed={view === 'all'}
              onClick={() => store.set({ ...selection, period: 'all' })}
            >
              Six weeks
            </button>
            <button
              aria-pressed={view === 'recent'}
              onClick={() => store.set({ ...selection, period: 'recent' })}
            >
              Latest three
            </button>
          </div>
        </div>
        <div
          className="delivery-chart"
          role="img"
          aria-label={`Weekly delivery chart. ${weeks.map((week) => `${week.label}: ${week.delivered} delivered of ${week.planned} planned`).join('; ')}.`}
        >
          <div className="chart-scale" aria-hidden="true">
            {[30, 20, 10, 0].map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
          <div className="chart-plot">
            <div className="chart-guides" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            {weeks.map((week, index) => (
              <div className="chart-week" key={week.label}>
                <div className="chart-bar-pair">
                  <div
                    className="delivery-bar"
                    style={{ height: `${(week.delivered / 30) * 100}%` }}
                  >
                    <strong>{week.delivered}</strong>
                  </div>
                  <div className="planned-bar" style={{ height: `${(week.planned / 30) * 100}%` }}>
                    <span>{week.planned}</span>
                  </div>
                </div>
                <span>{week.label}</span>
                {view === 'all' && index === 2 && <i className="period-divider" />}
              </div>
            ))}
          </div>
        </div>
        <div className="chart-footnote">
          <span>Completed tasks per week</span>
          <span>
            Latest week: {analysis.lastWeek!.delivered} / {analysis.lastWeek!.planned} planned (
            {((analysis.lastWeek!.delivered / analysis.lastWeek!.planned) * 100).toFixed(1)}%)
          </span>
        </div>
      </section>
      <section className="segment-report" data-orfin-section="delivery-segments">
        <div className="section-heading">
          <div>
            <h2>Two disciplines. Different momentum.</h2>
            <p>Where the change came from, across the same three-week windows.</p>
          </div>
          <select
            aria-label="Report segment"
            value={segment}
            onChange={(event) =>
              store.set({ ...selection, segment: event.target.value as ReportView['segment'] })
            }
          >
            <option value="all">All disciplines</option>
            {analysis.segments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="report-table-wrap">
          <table className="segment-table">
            <caption>Delivery, lead time and rework by discipline</caption>
            <thead>
              <tr>
                <th scope="col">Discipline</th>
                <th scope="col">Delivered</th>
                <th scope="col">Change</th>
                <th scope="col">Lead time</th>
                <th scope="col">Rework tasks</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((item) => (
                <tr key={item.id}>
                  <th scope="row">
                    <span className={`segment-dot ${item.id}`} />
                    {item.name}
                  </th>
                  <td>
                    {item.previous} → <strong>{item.current}</strong>
                  </td>
                  <td>
                    <span className="positive-change">+{item.changePercent}%</span>
                  </td>
                  <td>
                    {item.previousLeadDays} → <strong>{item.leadDays} days</strong>
                  </td>
                  <td>
                    {item.reworkPrevious} → <strong>{item.rework}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="evidence-ledger" data-orfin-section="delivery-evidence">
        <div className="evidence-intro">
          <FileText size={24} />
          <h2>Behind the numbers.</h2>
          <p>
            Useful context comes with a source. These observations help explain the pattern; they do
            not establish cause and effect.
          </p>
          <button
            className="text-button"
            onClick={() =>
              void orfin?.send(
                'Why did Brand improve faster than Web? Use the delivery ledger and cite the evidence IDs.',
              )
            }
          >
            <OrfinLogo size={17} /> What might explain the difference?
          </button>
        </div>
        <div className="evidence-entries">
          {deliveryReport.evidence.map((item) => (
            <article key={item.id}>
              <div>
                <span>{item.id}</span>
                <time>{item.date}</time>
              </div>
              <h3>{item.observation}</h3>
              <p>{item.caveat}</p>
              <span className="evidence-scope">{item.scope}</span>
            </article>
          ))}
        </div>
      </section>
      <p className="dataset-note">
        Source: {deliveryReport.source}. {deliveryReport.calendar} A task is counted once at
        delivery; rework counts tasks that required another review. No forecast is implied.
      </p>
    </div>
  );
}
