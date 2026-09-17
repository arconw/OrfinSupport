import { ArrowUpRight, CalendarDays, Plus, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Project } from '../data';
import { ProjectArt } from './Brand';

export function Avatars({ names, small = false }: { names: string[]; small?: boolean }) {
  return (
    <div className={`avatars ${small ? 'small' : ''}`}>
      {names.map((name, index) => (
        <span
          key={name}
          style={{ background: ['#e8c3b1', '#d2cbed', '#bcd7ca', '#d6def2'][index % 4] }}
          title={name}
        >
          {name}
        </span>
      ))}
    </div>
  );
}

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project) => void;
}) {
  return (
    <button
      className="project-card"
      onClick={() => onOpen(project)}
      aria-label={`Open ${project.name}`}
    >
      <div className={`project-cover ${project.color}`}>
        <span className="project-category">{project.category}</span>
        <ProjectArt kind={project.color} />
        <span className="open-project">
          <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="project-info">
        <div className="project-title">
          <h3>{project.name}</h3>
          <span className="project-dots">···</span>
        </div>
        <div className="project-progress-label">
          <span>{project.status}</span>
          <strong>{project.progress}%</strong>
        </div>
        <div className="progress-track">
          <span style={{ width: `${project.progress}%` }} />
        </div>
        <div className="project-bottom">
          <Avatars names={project.initials} small />
          <span>
            <CalendarDays size={12} />
            {project.due}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  if (!project) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close icon-btn" aria-label="Close project" onClick={onClose}>
          <X size={20} />
        </button>
        <div className={`project-cover ${project.color}`}>
          <ProjectArt kind={project.color} />
        </div>
        <div className="modal-body">
          <span className="muted">{project.category}</span>
          <h2 id="project-dialog-title">{project.name}</h2>
          <p>{project.description}</p>
          <div className="project-progress-label">
            <span>{project.status}</span>
            <strong>{project.progress}% complete</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${project.progress}%` }} />
          </div>
          <div className="project-bottom">
            <Avatars names={project.initials} />
            <span>
              <CalendarDays size={15} />
              Due {project.due}
            </span>
          </div>
          <button className="button primary" onClick={onClose}>
            Back to workspace
          </button>
        </div>
      </section>
    </div>
  );
}

export function ProjectsPage({
  projects,
  onOpen,
  onCreate,
}: {
  projects: Project[];
  onOpen: (project: Project) => void;
  onCreate: (name: string) => void;
}) {
  const [filter, setFilter] = useState('All projects');
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const visible = projects.filter(
    (project) =>
      (filter === 'All projects' || project.status === filter) &&
      project.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Space for your next big idea.</h1>
          <p>From first sketch to final handoff. It all lives here.</p>
        </div>
        <button className="button primary" onClick={() => dialog.current?.showModal()}>
          <Plus size={16} />
          New project
        </button>
      </div>
      <section data-orfin-section="project-board" className="all-projects">
        <div className="section-toolbar">
          <div className="tabs">
            {['All projects', 'In progress', 'In review'].map((tab) => (
              <button
                key={tab}
                className={filter === tab ? 'active' : ''}
                onClick={() => setFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a project"
              aria-label="Find a project"
            />
          </label>
        </div>
        <div className="project-grid full-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={onOpen} />
          ))}
        </div>
        {!visible.length && (
          <div className="empty-state">
            <Search size={28} />
            <h3>No projects found</h3>
            <p>Try another name or create a fresh project.</p>
          </div>
        )}
      </section>
      <dialog className="modal create-modal" ref={dialog}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) {
              onCreate(name.trim());
              setName('');
              dialog.current?.close();
            }
          }}
        >
          <div className="section-heading">
            <h2>Start something new</h2>
            <button
              type="button"
              className="icon-btn"
              aria-label="Close"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </div>
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your next great idea"
            autoFocus
          />
          <p className="muted">Creates a project in this demo session.</p>
          <button className="button primary" type="submit">
            Create project
          </button>
        </form>
      </dialog>
    </>
  );
}
