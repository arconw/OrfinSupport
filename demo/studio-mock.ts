import type { AgentEvent, ChatRequest, ToolContext } from '../src/core/types';
import { formatMessage } from '../src/core/locale';
import { resolveTranslations } from '../src/browser/i18n';
import { createStudioTools } from './tools';
import { DemoCartStore } from './cart-store';
import { money, productById, products } from './catalog';
import { studioCopy } from './locales/studio';
import { reportViewFromRequest } from './report-store';
import { reportViewCopy } from './locales/report-view';

type ScenarioKind = 'analysis' | 'compare' | 'review' | 'product' | 'cart' | 'changed' | 'catalog';
interface DemoCall {
  name: string;
  args: Record<string, unknown>;
}
interface Scenario {
  kind: ScenarioKind;
  calls: DemoCall[];
  productId?: string;
}

export function responseLocale(query: string, locale: string) {
  const languages: [string, RegExp][] = [
    [
      'en',
      /(?:answer|respond|reply|write|réponds?|responde)\s+(?:only\s+)?(?:in|en)\s+english|(?:ответ|отвеч|пиши)[^.]*английск/i,
    ],
    [
      'ru',
      /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+russian|(?:ответ|отвеч|пиши)[^.]*русск/i,
    ],
    ['fr', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+french|réponds?\s+en\s+français/i],
    ['es', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+spanish|responde\s+en\s+español/i],
    ['de', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+german|antworte\s+auf\s+deutsch/i],
    ['pt', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+portuguese/i],
    ['it', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+italian/i],
    ['nl', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+dutch/i],
    ['pl', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+polish/i],
    ['uk', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+ukrainian/i],
    ['tr', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+turkish/i],
    ['ar', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+arabic/i],
    ['hi', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+hindi/i],
    ['zh', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+chinese/i],
    ['ja', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+japanese/i],
    ['ko', /(?:answer|respond|reply|write)\s+(?:only\s+)?in\s+korean/i],
  ];
  return languages.find(([, pattern]) => pattern.test(query))?.[0] ?? locale;
}

function scenarioFor(request: ChatRequest): Scenario | undefined {
  const query = request.messages.at(-1)?.content.toLowerCase() ?? '';
  const selected = request.page.selectedSectionId ?? '';
  const named = products.filter(
    (product) => query.includes(product.name.toLowerCase()) || query.includes(product.id),
  );
  const pageProduct = products.find((product) =>
    request.page.sections.some((section) => section.id === `product-${product.id}`),
  );
  const product =
    named[0] ??
    (/second|втор|deuxième|zweite|第二|두 번째|الثاني/.test(query)
      ? products[1]
      : /\b(it|this|another|more|quantity)\b|add\s+(one|two|\d)\s+to|этот|его|ещ[её]|количеств/.test(
            query,
          )
        ? pageProduct
        : undefined);
  const call = (name: string, args: Record<string, unknown> = {}): DemoCall => ({ name, args });
  const analysisRequested =
    !named.length &&
    (/analys|analyz|delivery.*(?:result|report|trend)|brand.*web|web.*brand|why.*brand|анализ|аналіз|звіт|отч[её]т|тенденц|почему.*brand|analyse|analiz|análise|analise|rapporto|تحليل|विश्लेषण|分析|분석/.test(
      query,
    ) ||
      (selected.startsWith('delivery-') && /section|this page|эту секц|этой секц/.test(query)));
  if (
    /review|three.star|3.star|отзыв|три звезд|три звёзд|avis|reseña|bewertung|recensione|avaliaç|recenz|відгук|yorum|مراجع|समीक्षा|评价|レビュー|리뷰/.test(
      query,
    )
  ) {
    const target = product ?? products[1]!;
    const numericRating =
      /\b([1-5])\s*[- ]?\s*(?:stars?|зв[её]зд|étoiles?|estrellas?|sterne?)/.exec(query)?.[1];
    const rating = numericRating
      ? Number(numericRating)
      : /three|три|trois|drei|三|세|ثلاث/.test(query)
        ? 3
        : undefined;
    return {
      kind: 'review',
      productId: target.id,
      calls: [
        call('product_reviews', {
          productId: target.id,
          ...(rating ? { rating } : {}),
        }),
      ],
    };
  }
  if (
    /compar|which.*(?:monitor|display|luma)|сравн|какой.*монитор|vergleich|confront|vergelijk|porówn|порівн|karşılaştır|مقارن|तुलना|比较|比較|비교/.test(
      query,
    ) &&
    !analysisRequested &&
    !/brand.*web|web.*brand|discipline|segment|сегмент/.test(query)
  )
    return { kind: 'compare', calls: [call('compare_products')] };
  if (analysisRequested) return { kind: 'analysis', calls: [call('get_delivery_report')] };
  const change =
    /add|put.*cart|set.*quant|remove|delete.*cart|добав|корзин.*(?:полож|измени)|количеств|удал|ajout|retir|quantité|añad|agrega|entfern|hinzuf|aggiung|adicion|dodaj|додай|екле|ekle|أضف|дода|जोड़|加入|添加|追加|담아|추가/.test(
      query,
    );
  if (change && product) {
    const operation =
      /remove|delete|удал|убер|retir|entfern|elimina|remov|usuń|видал|حذف|हटा|删除|削除|제거/.test(
        query,
      )
        ? 'remove'
        : /set|quantity|количеств|quantité|cantidad|menge/.test(query)
          ? 'set'
          : 'add';
    const quantityMatch =
      /(?:quantity|количеств\S*|quantité|cantidad|menge)\s*(?:to|на|до|à|:|=)?\s*(\d)/.exec(
        query,
      ) ??
      /(?:add|добав\S*|ajout\S*|añad\S*|agrega|aggiung\S*)\s+(\d)\b/.exec(query) ??
      /\b(\d)\s*(?:units?|pieces?|штук|единиц|items?)\b/.exec(query);
    const quantity =
      operation === 'remove'
        ? 0
        : quantityMatch
          ? Number(quantityMatch[1])
          : /\b(two|две|два|deux|dos|zwei)\b/.test(query)
            ? 2
            : 1;
    const targets = named.length ? named : [product];
    return {
      kind: 'changed',
      productId: product.id,
      calls: targets.flatMap((target) => [
        ...(/open|show|открой|покажи|ouvre|ouvrir|abre/.test(query)
          ? [call('open_product', { productId: target.id })]
          : []),
        call('update_cart', { productId: target.id, operation, quantity }),
      ]),
    };
  }
  if (
    /cart|корзин|panier|carrito|warenkorb|carrello|carrinho|koszyk|кошик|sepet|سلة|कार्ट|购物车|カート|장바구니/.test(
      query,
    ) &&
    !product
  )
    return { kind: 'cart', calls: [call('get_cart')] };
  if (product)
    return {
      kind: 'product',
      productId: product.id,
      calls: [call('open_product', { productId: product.id })],
    };
  if (
    /equipment|catalog|shop|оборудован|каталог|магазин|équipement|boutique|tienda|ausrüstung|negozio|loja|sklep|обладнан|ekipman|معدات|उपकरण|商店|カタログ|장비/.test(
      query,
    )
  )
    return { kind: 'catalog', calls: [call('browse_products')] };
}

export async function* studioScenario(
  request: ChatRequest,
  signal: AbortSignal,
  store: DemoCartStore,
): AsyncGenerator<AgentEvent, boolean> {
  const scenario = scenarioFor(request);
  if (!scenario) return false;
  const copy = studioCopy(request.locale);
  if (!request.features.tools) {
    yield { type: 'delta', text: copy.unavailable };
    yield { type: 'done' };
    return true;
  }
  const tools = createStudioTools({ get: store.get, set: (cart) => store.replace(cart) });
  let reviews: unknown;
  for (const call of scenario.calls) {
    const activity = { id: crypto.randomUUID(), name: call.name, status: 'running' as const };
    yield { type: 'tool', tool: activity };
    const actions: AgentEvent[] = [];
    const context: ToolContext = {
      signal,
      request,
      emitAction: (action) => {
        if (
          (action.type === 'navigate' && !request.features.navigation) ||
          (action.type === 'highlight' && !request.features.sectionPicker)
        )
          return;
        actions.push({ type: 'action', action });
      },
    };
    try {
      signal.throwIfAborted();
      const result = await tools
        .find((tool) => tool.name === call.name)!
        .execute(call.args, context);
      if (call.name === 'product_reviews') reviews = result;
      for (const action of actions) {
        signal.throwIfAborted();
        yield action;
      }
      yield { type: 'tool', tool: { ...activity, status: 'complete' } };
    } catch {
      signal.throwIfAborted();
      yield { type: 'tool', tool: { ...activity, status: 'error' } };
      yield { type: 'delta', text: resolveTranslations(request.locale).errorReply };
      yield { type: 'done' };
      return true;
    }
  }
  if (scenario.kind === 'catalog' && request.features.navigation)
    yield {
      type: 'action',
      action: { type: 'navigate', path: '/shop', sectionId: 'equipment-catalog' },
    };
  const cart = store.get();
  const product = productById(scenario.productId ?? 'luma-27')!;
  const items =
    scenario.kind === 'catalog'
      ? products.map((item) => `${item.name} (${money(item.price, request.locale)})`).join(', ')
      : cart.items
          .map((item) => `${item.quantity} × ${productById(item.productId)!.name}`)
          .join(', ') || '—';
  const details = request.locale.startsWith('en')
    ? product.description
    : Object.values(product.specs)
        .slice(0, 5)
        .map((value) => value.replace(' inches', '″'))
        .join(' · ');
  let reply = formatMessage(
    scenario.kind === 'product' ? '**{name} — {price}**\n\n{details}' : copy[scenario.kind],
    {
      name: product.name,
      price: money(product.price, request.locale),
      details,
      items,
      total: money(
        cart.items.reduce(
          (sum, item) => sum + productById(item.productId)!.price * item.quantity,
          0,
        ),
        request.locale,
      ),
    },
  );
  if (scenario.kind === 'analysis')
    reply = reportViewCopy(reportViewFromRequest(request), request.locale) + reply;
  if (scenario.kind === 'review') {
    const data = reviews as {
      reviews: { id: string; author: string; rating: number; text: string }[];
    };
    if (!data.reviews.some((review) => review.id === 'l32-2'))
      reply = `**${product.name}**\n\n${data.reviews.map((review) => `${review.author}, ${review.rating}/5: “${review.text}”`).join('\n\n') || resolveTranslations(request.locale).sources + ': 0'}`;
  }
  for (const word of reply.match(/\S+\s*/g) ?? []) {
    signal.throwIfAborted();
    await new Promise<void>((resolve) => setTimeout(resolve, 12));
    signal.throwIfAborted();
    yield { type: 'delta', text: word };
  }
  yield { type: 'done' };
  return true;
}
