export interface NavigationOptions {
  path: string;
  sectionId?: string;
  allowedPaths: string[];
  storageKey: string;
  navigate?: (path: string) => void | Promise<void>;
}

export async function navigatePage(options: NavigationOptions): Promise<string> {
  const destination = new URL(options.path, location.origin);
  if (
    destination.origin !== location.origin ||
    !['http:', 'https:'].includes(destination.protocol) ||
    !options.allowedPaths.includes(destination.pathname)
  )
    throw new Error('This page is outside the assistant’s allowed navigation.');
  if (options.navigate) {
    await options.navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  } else if (location.href !== destination.href) {
    if (options.sectionId) {
      try {
        sessionStorage.setItem(
          `${options.storageKey}:navigation`,
          JSON.stringify({
            path: destination.pathname,
            sectionId: options.sectionId,
            expires: Date.now() + 15000,
          }),
        );
      } catch {
        location.assign(destination.href);
        return destination.pathname;
      }
    }
    location.assign(destination.href);
  }
  return destination.pathname;
}

export function pendingSection(storageKey: string): string | undefined {
  try {
    const key = `${storageKey}:navigation`;
    const pending = JSON.parse(sessionStorage.getItem(key) ?? 'null') as {
      path?: string;
      sectionId?: string;
      expires?: number;
    } | null;
    sessionStorage.removeItem(key);
    if (
      pending?.path === location.pathname &&
      typeof pending.sectionId === 'string' &&
      typeof pending.expires === 'number' &&
      pending.expires > Date.now()
    )
      return pending.sectionId;
  } catch {
    return;
  }
}
