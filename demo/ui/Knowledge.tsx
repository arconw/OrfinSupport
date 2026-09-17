import { BookOpen, ChevronRight, FileText, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { knowledge } from '../data';
import type { OrfinController } from '../../src/index';

export function KnowledgePage({ orfin }: { orfin: OrfinController | null }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>A little shared knowledge.</h1>
          <p>Good answers, in a place everyone can find.</p>
        </div>
        <button
          className="button primary"
          onClick={() => void orfin?.send('How do I get started with Northstar?')}
        >
          <Sparkles size={16} />
          Ask Orfin
        </button>
      </div>
      <section className="knowledge-section" data-orfin-section="knowledge">
        <div className="knowledge-intro">
          <BookOpen size={40} />
          <div>
            <h2>Your team’s field guide</h2>
            <p>The basics, the process, and the things it’s useful to know.</p>
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search articles"
              placeholder="Find an answer"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="article-grid">
          {knowledge
            .filter((article) =>
              `${article.title} ${article.content}`.toLowerCase().includes(query.toLowerCase()),
            )
            .map((article, index) => (
              <article key={article.id} id={article.id} className="article">
                <span className={`article-icon ${['blue', 'peach', 'green', 'lavender'][index]}`}>
                  {index === 3 ? <ShieldCheck size={23} /> : <FileText size={23} />}
                </span>
                <h2>{article.title}</h2>
                <p>
                  {active === article.id ? article.content : `${article.content.slice(0, 105)}…`}
                </p>
                <button
                  className="text-button"
                  aria-expanded={active === article.id}
                  onClick={() => setActive(active === article.id ? null : article.id)}
                >
                  {active === article.id ? 'Close article' : 'Read article'}
                  <ChevronRight size={14} />
                </button>
              </article>
            ))}
        </div>
      </section>
      <div className="knowledge-note">
        <Sparkles size={18} />
        <div>
          <strong>Answers with a little context.</strong>
          <p>
            Ask Orfin about plans, onboarding, or project delivery. It can use these articles and
            show you where the answer came from.
          </p>
        </div>
      </div>
    </>
  );
}
