import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAllowedNavigationPath } from '../../src/core/navigation';
import { navigatePage } from '../../src/browser/navigation';

afterEach(() => vi.unstubAllGlobals());

describe('navigation path allowlist', () => {
  it.each(['/bounty', '/bounty/', '/bounty/123', '/bounty/123/history', '/profile'])(
    'allows a concrete registered path %s',
    (path) => expect(isAllowedNavigationPath(path, ['/bounty/*', '/profile'])).toBe(true),
  );

  it.each([
    '/bounties/123',
    '/bounty-other/123',
    '/profile/edit',
    '/bounty/*',
    '/bounty/../admin',
    '/bounty/%2e%2e/admin',
    '/bounty/%2f..%2fadmin',
    '/bounty/%5c..%5cadmin',
    '/bounty/%252e%252e/admin',
    '/bounty/%ZZ',
    '/bounty/123?next=/admin',
    '//evil.test/bounty/123',
    'https://evil.test/bounty/123',
  ])('rejects a path outside the allowlist or ambiguous path %s', (path) => {
    expect(isAllowedNavigationPath(path, ['/bounty/*', '/profile'])).toBe(false);
  });

  it('keeps exact paths exact and escapes pattern metacharacters', () => {
    expect(isAllowedNavigationPath('/bounty/123', ['/bounty'])).toBe(false);
    expect(isAllowedNavigationPath('/v1.0/item', ['/v1.0/*'])).toBe(true);
    expect(isAllowedNavigationPath('/v1x0/item', ['/v1.0/*'])).toBe(false);
    expect(isAllowedNavigationPath('/anything/nested', ['/*'])).toBe(true);
    expect(isAllowedNavigationPath('/', ['/*'])).toBe(true);
  });

  it('passes an allowed same-origin destination with query and fragment to the host router', async () => {
    vi.stubGlobal('location', new URL('https://example.test/'));
    const navigate = vi.fn();
    await expect(
      navigatePage({
        path: 'https://example.test/bounty/123?view=full#reward',
        allowedPaths: ['/bounty/*'],
        storageKey: 'test',
        navigate,
      }),
    ).resolves.toBe('/bounty/123');
    expect(navigate).toHaveBeenCalledWith('/bounty/123?view=full#reward');
  });

  it.each([
    'https://evil.test/bounty/123',
    '//evil.test/bounty/123',
    '/bounty/../admin',
    '/bounty/*',
  ])('blocks invalid browser navigation before invoking the router: %s', async (path) => {
    vi.stubGlobal('location', new URL('https://example.test/'));
    const navigate = vi.fn();
    await expect(
      navigatePage({ path, allowedPaths: ['/bounty/*'], storageKey: 'test', navigate }),
    ).rejects.toThrow('outside');
    expect(navigate).not.toHaveBeenCalled();
  });
});
