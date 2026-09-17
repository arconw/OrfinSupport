import type { AgentEvent, ChatTransport } from '../src/core/types';
import { knowledge } from './data';

export function createDemoTransport(): ChatTransport {
  return {
    async *stream(request, signal) {
      const query = request.messages.at(-1)?.content.toLowerCase() ?? '';
      const ru = request.locale === 'ru';
      let reply = ru
        ? 'Northstar — рабочее пространство команды. Здесь можно следить за проектами, задачами и прогрессом. Попросите показать проекты, открыть базу знаний или рассказать о выбранной секции.'
        : 'Northstar gives your team a shared home for projects, progress, and the little things that move work forward. You can explore your projects, check the team’s pulse, or ask me to show you around.';
      const events: AgentEvent[] = [];
      const selected = request.page.sections.find(
        (section) => section.id === request.page.selectedSectionId,
      );
      if (/tour|show me around|экскурс|покажи проект/.test(query) && request.features.tour) {
        events.push({ type: 'action', action: { type: 'tour' } });
        reply = ru
          ? 'Начинаем экскурсию. Нажмите «Спросить» на любом шаге — я отвечу, и вы сможете продолжить.'
          : 'Let’s take a look together. You can ask a question at any step and pick up right where you left off.';
      } else if (/open|navigate|открой|перей/.test(query) && request.features.navigation) {
        const path = /knowledge|guide|знани|документ/.test(query)
          ? '/knowledge'
          : /setting|настрой/.test(query)
            ? '/settings'
            : '/projects';
        events.push({
          type: 'action',
          action: {
            type: 'navigate',
            path,
            sectionId:
              path === '/knowledge'
                ? 'knowledge'
                : path === '/settings'
                  ? 'settings'
                  : 'project-board',
          },
        });
        reply = ru
          ? 'Открываю нужную страницу. Можете выбрать секцию, и я расскажу подробнее.'
          : `Here’s your ${path === '/knowledge' ? 'team knowledge' : path === '/settings' ? 'assistant playground' : 'project board'}. Ask about a section if you’d like to go a little deeper.`;
      } else if (/show|where|highlight|покажи|где/.test(query) && request.features.sectionPicker) {
        const sectionId = /team|capacity|pulse|команд/.test(query)
          ? 'capacity'
          : /task|задач/.test(query)
            ? 'tasks'
            : 'projects';
        events.push({ type: 'action', action: { type: 'highlight', sectionId } });
        reply = ru
          ? 'Вот нужная секция — я подсветил её для вас. Здесь видно текущее состояние работы.'
          : `Right here! I’ve highlighted ${sectionId === 'capacity' ? 'your team pulse' : sectionId === 'tasks' ? 'your next steps' : 'your active projects'} so it’s easy to find. You can open a project to see its timeline and the people working on it.`;
      } else if (/capacity|availability|загруз|свобод/.test(query) && request.features.tools) {
        events.push({
          type: 'tool',
          tool: { id: 'demo-capacity', name: 'team_capacity', status: 'running' },
        });
        reply = ru
          ? 'В демонстрационной команде 12 человек. На эту неделю запланировано 36 из 48 доступных дней: загрузка 75%. Свободно ещё 12 дней.'
          : 'Your team has some breathing room this week. **12 people**, 48 available days, and 36 days planned — that’s **75% capacity**. There are 12 days of room for new work. This is sample workspace data.';
      } else if (/plan|price|cost|billing|план|стои|цен/.test(query)) {
        events.push({ type: 'sources', sources: [knowledge[2]!] });
        reply = ru
          ? 'В демо используется план Studio: $24 за участника в месяц, неограниченное количество проектов, гостевой доступ и 100 ГБ хранилища. Это вымышленные данные: списаний в демо нет.'
          : 'You’re on the **Studio plan**: $24 per member, per month, with unlimited projects, guest access, and 100 GB of storage. Your workspace has 12 members. These are fictional demo details — no payments happen here.';
      } else if (selected) {
        reply = ru
          ? `**${selected.title}**\n\nЭто секция вашего рабочего пространства. ${selected.description}\n\nВы можете продолжить экскурсию или задать ещё один вопрос.`
          : `**${selected.title}**\n\n${selected.description}\n\n${selected.id === 'projects' ? 'Brand refresh is furthest along at 72%, followed by Website experience at 48%. Click a project card to see the brief and due date.' : 'Ask a follow-up, or keep exploring. I’ll be right here.'}`;
      } else if (/privacy|private|context|контекст|памят/.test(query)) {
        events.push({ type: 'sources', sources: [knowledge[3]!] });
        reply = knowledge[3]!.content;
      } else if (/page|страниц/.test(query)) {
        reply = ru
          ? 'На странице собраны основные разделы Northstar:\n\n- Активные проекты и их прогресс\n- Загрузка команды по дням\n- Последние события\n- Ваши ближайшие задачи\n\nНажмите «Спросить про секцию», чтобы разобрать что-то подробнее.'
          : '**A shared view of your team’s work.**\n\n- **Active projects** — what’s moving, who’s involved, and when it’s due.\n- **Team pulse** — how the week is shaping up.\n- **What’s happening** — the latest updates from your teammates.\n- **Your next steps** — small tasks you can check off right here.\n\nWant a closer look? Ask me to show you a section.';
      }
      for (const event of events) {
        signal.throwIfAborted();
        yield event;
      }
      for (const word of reply.match(/\S+\s*/g) ?? []) {
        signal.throwIfAborted();
        await new Promise<void>((resolve, reject) => {
          const abort = () => {
            clearTimeout(timer);
            reject(signal.reason);
          };
          const timer = setTimeout(() => {
            signal.removeEventListener('abort', abort);
            resolve();
          }, 22);
          signal.addEventListener('abort', abort, { once: true });
        });
        yield { type: 'delta', text: word };
      }
      if (events.some((event) => event.type === 'tool'))
        yield {
          type: 'tool',
          tool: { id: 'demo-capacity', name: 'team_capacity', status: 'complete' },
        };
      yield { type: 'done' };
    },
  };
}
