export class Presence<T> {
  value: T | undefined;
  visible = false;
  exiting = false;
  private frame = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private refresh: () => void) {}

  reconcile(value: T | undefined, duration: number) {
    if (value !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
      if (this.value === undefined && duration) {
        this.visible = false;
        this.frame = requestAnimationFrame(() => {
          this.frame = requestAnimationFrame(() => {
            this.frame = 0;
            this.visible = true;
            this.refresh();
          });
        });
      } else if (this.exiting || !duration) {
        cancelAnimationFrame(this.frame);
        this.frame = 0;
        this.visible = true;
      }
      this.value = value;
      this.exiting = false;
    } else if (this.value !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.visible = false;
      if (!duration) {
        this.dispose();
      } else if (!this.exiting) {
        this.exiting = true;
        this.timer = setTimeout(() => {
          this.dispose();
          this.refresh();
        }, duration);
      }
    }
  }

  dispose() {
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    this.timer = undefined;
    this.frame = 0;
    this.value = undefined;
    this.visible = false;
    this.exiting = false;
  }
}

export function motionDuration(shadow: ShadowRoot, name: string, fallback: number) {
  const root = shadow.querySelector('.orfin');
  const value = root ? getComputedStyle(root).getPropertyValue(name).trim() : '';
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed)
    ? Math.min(1500, Math.max(0, parsed * (value.endsWith('ms') ? 1 : 1000)))
    : fallback;
}
