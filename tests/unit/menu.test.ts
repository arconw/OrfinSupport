import { expect, it } from 'vitest';
import { resolveMenuActions } from '../../src/core/menu';
import { resolveSettings } from '../../src/core/settings';
import { resolveTranslations } from '../../src/browser/i18n';
import type { CustomMenuAction, SettingsInput } from '../../src/core/types';

const compare: CustomMenuAction = {
  id: 'compare',
  label: 'Compare',
  prompt: 'Compare the selected products.',
  translations: {
    en: { label: 'Compare products' },
    fr: { label: 'Comparer' },
    'fr-CA': { prompt: 'Compare ces produits.' },
  },
  requires: ['tools'],
  visible: ({ url }) => new URL(url).pathname.startsWith('/products'),
};
const resolve = (input: SettingsInput, url = 'https://project.test/products', busy = false) => {
  const settings = resolveSettings(input);
  return resolveMenuActions(
    settings,
    { url, locale: settings.locale, features: settings.features },
    resolveTranslations(settings.locale),
    busy,
  );
};

it('replaces, reorders, de-duplicates, empties and restores the default menu', () => {
  expect(
    resolve({ menuActions: ['page', compare, 'pick', 'page', compare] }).map(({ key }) => key),
  ).toEqual(['builtin:page', 'custom:compare', 'builtin:pick']);
  expect(resolve({ menuActions: [] })).toEqual([]);
  expect(resolve({ menuActions: null }).map(({ builtin }) => builtin)).toEqual([
    'tour',
    'pick',
    'page',
  ]);
  expect(
    resolveSettings({ locale: 'fr' }, resolveSettings({ menuActions: [] })).menuActions,
  ).toEqual([]);
});

it('applies regional translations, feature requirements, page predicates and busy state', () => {
  expect(resolve({ menuActions: [compare], locale: 'fr-CA' }, undefined, true)).toMatchObject([
    { label: 'Comparer', prompt: 'Compare ces produits.', disabled: true },
  ]);
  expect(resolve({ menuActions: [compare], locale: 'ja' })).toMatchObject([
    { label: 'Compare products', prompt: compare.prompt },
  ]);
  expect(resolve({ menuActions: [compare] }, 'https://project.test/reports')).toEqual([]);
  expect(resolve({ menuActions: [compare], features: { tools: false } })).toEqual([]);
  expect(
    resolve({ features: { tour: false, sectionPicker: false } }).map(({ builtin }) => builtin),
  ).toEqual(['page']);
});

it('contains a broken project predicate and ignores empty custom commands', () => {
  expect(
    resolve({
      menuActions: [
        {
          ...compare,
          visible() {
            throw new Error('Project predicate');
          },
        },
        { ...compare, id: 'empty', prompt: ' ' },
        'page',
      ],
    }),
  ).toMatchObject([{ builtin: 'page' }]);
});

it('keeps declarative route visibility through JSON and respects path boundaries and hash routers', () => {
  const action: CustomMenuAction = {
    ...compare,
    visible: undefined,
    visibleOn: ['/products/*', '/compare'],
  };
  const menuActions = JSON.parse(JSON.stringify([action, 'page']));
  for (const url of [
    'https://project.test/products',
    'https://project.test/products/compact?color=blue',
    'https://project.test/compare',
    'https://project.test/base/#/products/compact?color=blue',
  ])
    expect(resolve({ menuActions }, url)[0]?.key).toBe('custom:compare');
  for (const url of [
    'https://project.test/products-other',
    'https://project.test/reports',
    'https://project.test/base/#/reports',
  ])
    expect(resolve({ menuActions }, url).map((action) => action.key)).toEqual(['builtin:page']);
  expect(resolve({ menuActions: [{ ...action, visibleOn: [] }] })).toEqual([]);
});
