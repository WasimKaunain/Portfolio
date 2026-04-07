export type PileItem = {
  id: string;
  html: string;
  width: number;
  height: number;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function snapshotElement(el: HTMLElement): PileItem {
  const r = el.getBoundingClientRect();
  return {
    id: uid(),
    html: el.outerHTML,
    width: Math.max(40, Math.round(r.width)),
    height: Math.max(24, Math.round(r.height)),
  };
}

export function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
