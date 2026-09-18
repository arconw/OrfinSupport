import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flag,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import type { OrfinController } from '../../src/index';
import { workspaceStatistics, type Project } from '../data';
import { dailyDelivery } from '../analytics';
import { OrfinLogo, WelcomeArt } from './Brand';
import { Avatars, ProjectCard } from './Projects';

export function Overview({
  orfin,
  projects,
  navigate,
  onProject,
}: {
  orfin: OrfinController | null;
  projects: Project[];
  navigate: (path: string) => void;
  onProject: (project: Project) => void;
}) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [week, setWeek] = useState('This week');
  const chart = week === 'This week' ? dailyDelivery.current : dailyDelivery.previous;
  return (
    <>
      <div className="page-heading">
        <div className="heading-copy">
          <div className="date-line">
            <span className="sun-icon">✳</span> A good day to make something great
          </div>
          <h1>Your team. One clear view.</h1>
          <p>A little perspective on everything moving forward.</p>
        </div>
        <button className="button tour-button" onClick={() => void orfin?.startTour()}>
          <OrfinLogo size={18} />
          Take a tour
          <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="overview-top">
        <section className="welcome-banner" data-orfin-section="welcome">
          <div className="welcome-copy">
            <span className="welcome-note">
              <span className="tiny-dot" />
              Your workspace, connected
            </span>
            <h2>
              Less looking.
              <br />
              More making.
            </h2>
            <p>
              Good work starts with a little clarity.
              <br />
              Let’s find your next step.
            </p>
            <button onClick={() => orfin?.open()}>
              Find your way with Orfin
              <ArrowRight size={15} />
            </button>
          </div>
          <WelcomeArt />
        </section>
        <section className="pulse-card" data-orfin-section="capacity">
          <div className="section-heading">
            <h2>Team pulse</h2>
            <button
              className="icon-btn"
              aria-label="Ask about team pulse"
              onClick={() =>
                void orfin?.explain(
                  orfin.registry.discover('sections').find((section) => section.id === 'capacity')!,
                )
              }
            >
              <CircleHelp size={15} />
            </button>
          </div>
          <div className="pulse-stat">
            <strong>
              {chart.reduce((sum, count) => sum + count, 0)}
              <span>tasks completed</span>
            </strong>
            <span className="positive">
              <ArrowUpRight size={13} />
              {week === 'This week' ? '9.1%' : '10%'}
            </span>
          </div>
          <div
            className="chart"
            role="img"
            aria-label={`Completed tasks by day: ${chart.map((count, index) => `${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]} ${count}`).join(', ')}`}
          >
            {chart.map((height, index) => (
              <div className="chart-column" key={index}>
                <div
                  className={`bar ${index === 3 ? 'current' : ''}`}
                  style={{ height: `${(height / 7) * 100}%` }}
                >
                  <span>{height}</span>
                </div>
                <small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small>
              </div>
            ))}
          </div>
          <div className="chart-footer">
            <span>
              <i />
              {week === 'This week' ? dailyDelivery.currentPeriod : dailyDelivery.previousPeriod}
            </span>
            <select
              aria-label="Chart period"
              value={week}
              onChange={(event) => setWeek(event.target.value)}
            >
              <option>This week</option>
              <option>Last week</option>
            </select>
          </div>
        </section>
      </div>
      <div className="metric-strip">
        <div>
          <span className="metric-icon blue">
            <Flag size={16} />
          </span>
          <span>
            <strong>{workspaceStatistics.activeProjects}</strong> active projects
          </span>
          <small>2 near the finish line</small>
        </div>
        <div>
          <span className="metric-icon green">
            <Check size={16} />
          </span>
          <span>
            <strong>{workspaceStatistics.onTimeDelivery}</strong> on-time delivery
          </span>
          <small>
            <ArrowUpRight size={11} />
            6% this month
          </small>
        </div>
        <div>
          <Avatars names={['JD', 'MK', 'AL']} small />
          <span>
            <strong>{workspaceStatistics.members}</strong> lovely teammates
          </span>
          <button aria-label="View team knowledge" onClick={() => navigate('/knowledge')}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <section className="projects-section" data-orfin-section="projects">
        <div className="section-heading">
          <div className="section-title">
            <h2>Active projects</h2>
            <span className="count-badge">{projects.length}</span>
          </div>
          <button className="text-button" onClick={() => navigate('/projects')}>
            All projects
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="project-grid">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={onProject} />
          ))}
        </div>
      </section>
      <div className="overview-bottom">
        <section className="activity-card" data-orfin-section="activity">
          <div className="section-heading">
            <h2>What’s happening</h2>
            <button
              className="icon-btn"
              aria-label="Ask about recent activity"
              onClick={() => void orfin?.highlight('activity')}
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
          <div className="activity-item">
            <span className="activity-avatar peach">JD</span>
            <div>
              <p>
                <strong>Jamie</strong> added new explorations to{' '}
                <button onClick={() => onProject(projects[0]!)}>Brand refresh</button>
              </p>
              <small>12 minutes ago</small>
              <div className="file-chip">
                <span className="figma-mark">F</span>Brand explorations.fig<span>4.2 MB</span>
              </div>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-avatar lavender">SN</span>
            <div>
              <p>
                <strong>Sarah</strong> completed the homepage wireframes
              </p>
              <small>
                48 minutes ago <span className="activity-dot">·</span> Website experience
              </small>
            </div>
            <span className="completed-badge">
              <Check size={12} />
            </span>
          </div>
          <div className="activity-item">
            <span className="activity-avatar green">MK</span>
            <div>
              <p>
                <strong>Max</strong> left feedback on the mobile flow
              </p>
              <small>
                2 hours ago <span className="activity-dot">·</span> Mobile companion
              </small>
            </div>
          </div>
        </section>
        <section className="tasks-card" data-orfin-section="tasks">
          <div className="section-heading">
            <h2>Your next steps</h2>
            <span className="count-badge">{3 - completed.length}</span>
          </div>
          {[
            {
              id: 'review',
              title: 'Review brand explorations',
              project: 'Brand refresh',
              due: 'Today',
            },
            {
              id: 'sync',
              title: 'Prepare for the design sync',
              project: 'Team workspace',
              due: 'Tomorrow',
            },
            {
              id: 'feedback',
              title: 'Share feedback on wireframes',
              project: 'Website experience',
              due: 'Sep 21',
            },
          ].map((task) => (
            <label
              className={`task-item ${completed.includes(task.id) ? 'is-complete' : ''}`}
              key={task.id}
            >
              <input
                type="checkbox"
                checked={completed.includes(task.id)}
                onChange={() =>
                  setCompleted((previous) =>
                    previous.includes(task.id)
                      ? previous.filter((id) => id !== task.id)
                      : [...previous, task.id],
                  )
                }
              />
              <span className="task-checkbox">
                <Check size={11} />
              </span>
              <span className="task-copy">
                <strong>{task.title}</strong>
                <small>{task.project}</small>
              </span>
              <span className={`task-due ${task.due === 'Today' ? 'today' : ''}`}>{task.due}</span>
            </label>
          ))}
          <button className="task-add" onClick={() => navigate('/projects')}>
            <Plus size={14} />
            Find your next project
          </button>
          <div className="task-note">
            <Clock3 size={13} />
            Small steps. Real progress.
          </div>
        </section>
      </div>
      <div className="workspace-footer">
        <span>
          <span className="tiny-dot" />
          All caught up. Keep making good things.
        </span>
        <a href="https://github.com/arconw/OrfinSupport" target="_blank" rel="noreferrer">
          Made to be explored
          <ArrowDown size={11} />
        </a>
      </div>
    </>
  );
}
