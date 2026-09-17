export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function spotlightRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();
  const top = Math.max(6, rect.top - 6);
  const left = Math.max(6, rect.left - 6);
  return {
    top,
    left,
    width: Math.max(0, Math.min(innerWidth - 6, rect.right + 6) - left),
    height: Math.max(0, Math.min(innerHeight - 6, rect.bottom + 6) - top),
  };
}

export function popoverPosition(
  rect: Rect,
  width = 300,
  height = 180,
  avoid?: Rect,
): { top: number; left: number } {
  const safeWidth = Math.min(width, innerWidth - 24);
  const safeHeight = Math.min(height, innerHeight - 24);
  const overlap = (a: Rect, b?: Rect) =>
    b
      ? Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left)) *
        Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top))
      : 0;
  const candidates = [
    { left: rect.left + rect.width + 16, top: rect.top },
    { left: rect.left - safeWidth - 16, top: rect.top },
    { left: rect.left, top: rect.top + rect.height + 16 },
    { left: rect.left, top: rect.top - safeHeight - 16 },
  ].map((position) => ({
    left: Math.max(12, Math.min(position.left, innerWidth - safeWidth - 12)),
    top: Math.max(12, Math.min(position.top, innerHeight - safeHeight - 12)),
    width: safeWidth,
    height: safeHeight,
  }));
  candidates.sort(
    (a, b) =>
      overlap(a, avoid) * 100 + overlap(a, rect) - (overlap(b, avoid) * 100 + overlap(b, rect)),
  );
  return {
    left: candidates[0]!.left,
    top: candidates[0]!.top,
  };
}
