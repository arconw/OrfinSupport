export function navigationPathPattern(path: string): string {
  const subtree = path.endsWith('/*');
  const base = subtree ? path.slice(0, -2) : path;
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return subtree ? `^${escaped}(?:/[^*?#\\\\\\s]*)?$` : `^${escaped}$`;
}

export function isAllowedNavigationPath(pathname: string, allowedPaths: string[]): boolean {
  if (!pathname.startsWith('/') || pathname.startsWith('//') || /[\\\s*?#]/.test(pathname))
    return false;
  try {
    if (new URL(pathname, 'https://orfin.invalid').pathname !== pathname) return false;
    if (
      pathname.split('/').some((segment) => {
        const decoded = decodeURIComponent(segment);
        return decoded === '.' || decoded === '..' || /[%/\\]/.test(decoded);
      })
    )
      return false;
  } catch {
    return false;
  }
  return allowedPaths.some((path) => new RegExp(navigationPathPattern(path)).test(pathname));
}
