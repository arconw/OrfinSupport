import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  FolderKanban,
  Github,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OrfinSupport } from '../../src/adapters/react';
import { createHttpTransport } from '../../src/core/transport';
import { defaultSettings, resolveSettings } from '../../src/core/settings';
import type { OrfinController, OrfinOptions, SettingsInput } from '../../src/index';
import { initialProjects, sections } from '../data';
import type { Project } from '../data';
import { createDemoTransport } from '../mock';
import { NorthstarLogo, OrfinLogo } from './Brand';
import { KnowledgePage } from './Knowledge';
import { Overview } from './Overview';
import { ProjectDialog, ProjectsPage } from './Projects';
import { SettingsPage } from './Settings';

declare global {
  interface Window {
    __orfin?: OrfinController;
  }
}

const routes = [
  { path: '/', title: 'Overview', icon: LayoutDashboard },
  { path: '/projects', title: 'Projects', icon: FolderKanban },
  { path: '/knowledge', title: 'Knowledge', icon: BookOpen },
  { path: '/settings', title: 'Playground', icon: Settings2 },
];
const routeFromURL = () =>
  location.hash.startsWith('#/') ? location.hash.slice(1).split('?')[0]! : '/';

export function App() {
  const [path, setPath] = useState(routeFromURL);
  const [orfin, setOrfin] = useState<OrfinController | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notification, setNotification] = useState(false);
  const [toast, setToast] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useCallback((route: string) => {
    history.pushState({}, '', `${location.pathname}${route === '/' ? '' : `#${route}`}`);
    setPath(route);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  useEffect(() => {
    const listener = () => {
      setPath(routeFromURL());
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', listener);
    window.addEventListener('hashchange', listener);
    return () => {
      window.removeEventListener('popstate', listener);
      window.removeEventListener('hashchange', listener);
    };
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const options = useMemo<OrfinOptions>(
    () => ({
      transport:
        mode === 'demo' ? createDemoTransport() : createHttpTransport({ endpoint: '/api/orfin' }),
      sections,
      initiallyOpen: true,
      navigate,
      allowedPaths: routes.map((route) => route.path),
      theme: 'cloud',
      memory: { key: 'orfin:northstar:v1' },
    }),
    [mode, navigate],
  );
  const ready = useCallback((controller: OrfinController) => {
    setOrfin(controller);
    window.__orfin = controller;
  }, []);
  useEffect(() => {
    if (!orfin) return;
    orfin.updateSettings(settings);
    return orfin.subscribe(() =>
      setSettings((previous) =>
        JSON.stringify(previous) === JSON.stringify(orfin.settings)
          ? previous
          : { ...orfin.settings },
      ),
    );
  }, [orfin]);
  const update = (input: SettingsInput) => {
    setSettings((previous) => resolveSettings(input, previous));
    orfin?.updateSettings(input);
  };
  const active = routes.find((route) => route.path === path) ?? routes[0]!;
  return (
    <>
      <div className="demo-bar" role="region" aria-label="OrfinSupport playground">
        <a
          className="library-brand"
          href="https://github.com/arconw/OrfinSupport"
          target="_blank"
          rel="noreferrer"
        >
          <span className="brand-mark">
            <OrfinLogo size={23} />
          </span>
          OrfinSupport<span className="version">Playground</span>
        </a>
        <div className="demo-bar-right">
          <span className="demo-caption">A little guidance goes a long way.</span>
          <label className="mode-switch">
            <span className={`connection-dot ${mode}`} />
            <select
              aria-label="Assistant provider"
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as 'demo' | 'live');
                setToast(
                  event.target.value === 'live'
                    ? 'Live AI uses your local llm-gate through the demo server.'
                    : 'Demo mode uses sample responses. No API needed.',
                );
              }}
            >
              <option value="demo">Demo replies</option>
              <option value="live">Live AI · local gateway</option>
            </select>
            <ChevronDown size={12} />
          </label>
          <a
            className="github-link"
            href="https://github.com/arconw/OrfinSupport"
            target="_blank"
            rel="noreferrer"
            aria-label="View OrfinSupport on GitHub"
          >
            <Github size={17} />
            <span>View source</span>
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <aside className={`sidebar ${mobileMenu ? 'visible' : ''}`}>
        <button className="workspace-brand" onClick={() => navigate('/')}>
          <NorthstarLogo />
          <span>
            northstar<span>Studio workspace</span>
          </span>
          <ChevronDown size={14} />
        </button>
        <div className="sidebar-navigation">
          <span className="nav-group-label">Workspace</span>
          <nav aria-label="Workspace">
            {routes.map((route) => (
              <button
                key={route.path}
                className={active.path === route.path ? 'active' : ''}
                onClick={() => navigate(route.path)}
                aria-current={active.path === route.path ? 'page' : undefined}
              >
                <route.icon size={17} />
                <span>{route.title}</span>
                {route.path === '/projects' && <small>{projects.length}</small>}
                {route.path === '/settings' && <span className="nav-new">Try it</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <div className="nav-project-heading">
            <span className="nav-group-label">Your projects</span>
            <button
              className="icon-btn"
              aria-label="Browse projects"
              onClick={() => navigate('/projects')}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="nav-projects">
            {projects.slice(0, 3).map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  navigate('/projects');
                  setSelectedProject(project);
                }}
              >
                <span className={`project-dot ${project.color}`} />
                {project.name}
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="sidebar-tip-icon">
              <OrfinLogo size={26} />
            </div>
            <h3>A guide by your side.</h3>
            <p>
              Orfin knows this workspace.
              <br />
              Go ahead, ask a question.
            </p>
            <button onClick={() => orfin?.open()}>
              Meet your assistant
              <ArrowUpRight size={13} />
            </button>
          </div>
          <button
            className="sidebar-help"
            onClick={() => void orfin?.send('How does OrfinSupport work?')}
          >
            <CircleHelp size={16} />
            Help & getting started
            <ArrowUpRight size={12} />
          </button>
          <button className="user-profile" onClick={() => navigate('/settings')}>
            <span className="user-avatar">AM</span>
            <span>
              Alex Morgan<small>Workspace owner</small>
            </span>
            <ChevronDown size={13} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header" aria-label="Northstar workspace">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-btn"
              aria-label="Toggle navigation"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{active.title}</strong>
          </div>
          <div className="header-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <span>Quick find</span>
              <kbd>
                <Command size={10} />K
              </kbd>
            </button>
            <span className="header-separator" />
            <div className="notification-wrap">
              <button
                className="icon-btn notification-button"
                aria-label="Notifications"
                aria-expanded={notification}
                onClick={() => setNotification(!notification)}
              >
                <Bell size={18} />
                <i />
              </button>
              {notification && (
                <div className="notification-popover">
                  <strong>You’re all caught up</strong>
                  <p>No new notifications. Your next steps are waiting on the overview.</p>
                  <button
                    className="text-button"
                    onClick={() => {
                      navigate('/');
                      setNotification(false);
                    }}
                  >
                    View overview
                  </button>
                </div>
              )}
            </div>
            <span className="user-avatar small-avatar">AM</span>
          </div>
        </header>
        <main className={`main-content ${path !== '/' ? 'inner-page' : ''}`}>
          {path === '/' && (
            <Overview
              orfin={orfin}
              projects={projects}
              navigate={navigate}
              onProject={setSelectedProject}
            />
          )}
          {path === '/projects' && (
            <ProjectsPage
              projects={projects}
              onOpen={setSelectedProject}
              onCreate={(name) => {
                setProjects((previous) => [
                  ...previous,
                  {
                    id: crypto.randomUUID(),
                    name,
                    category: 'New project',
                    progress: 0,
                    due: 'Oct 20',
                    color: 'green',
                    status: 'In progress',
                    initials: ['AM'],
                    description:
                      'A fresh start for your next idea. This project lives in the current demo session.',
                  },
                ]);
                setToast('Your new project is ready.');
              }}
            />
          )}
          {path === '/knowledge' && <KnowledgePage orfin={orfin} />}
          {path === '/settings' && (
            <SettingsPage orfin={orfin} settings={settings} update={update} />
          )}
        </main>
      </div>
      <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <section
            className="modal search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Quick find"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="search-modal-input">
              <Search size={20} />
              <input
                autoFocus
                placeholder="Find a page, project, or answer…"
                aria-label="Quick find"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button
                className="icon-btn"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            {routes
              .filter((route) => route.title.toLowerCase().includes(search.toLowerCase()))
              .map((route) => (
                <button
                  className="search-result"
                  key={route.path}
                  onClick={() => {
                    navigate(route.path);
                    setSearchOpen(false);
                  }}
                >
                  <route.icon size={17} />
                  {route.title}
                  <ChevronRight size={14} />
                </button>
              ))}
            {search && (
              <button
                className="search-result"
                onClick={() => {
                  void orfin?.send(search);
                  setSearchOpen(false);
                }}
              >
                <MessageCircle size={17} />
                Ask Orfin about “{search}”<ArrowUpRight size={14} />
              </button>
            )}
          </section>
        </div>
      )}
      <OrfinSupport key={mode} options={options} onReady={ready} />
    </>
  );
}
