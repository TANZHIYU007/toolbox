/**
 * 颜色解析与转换。
 * 单独一个文件是想说明：工具目录里除了 meta.ts / Tool.tsx，
 * 想放多少辅助模块都行，注册表只认那两个约定文件。
 */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number, min = 0, max = 255) => Math.min(max, Math.max(min, n));

export function parseColor(input: string): Rgb | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;

  // #rgb / #rgba / #rrggbb / #rrggbbaa
  const hex = /^#?([0-9a-f]{3,8})$/.exec(text);
  if (hex) {
    const h = hex[1]!;
    const expand = (s: string) => parseInt(s.length === 1 ? s + s : s, 16);
    if (h.length === 3 || h.length === 4) {
      return {
        r: expand(h[0]!), g: expand(h[1]!), b: expand(h[2]!),
        a: h.length === 4 ? expand(h[3]!) / 255 : 1,
      };
    }
    if (h.length === 6 || h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.%]+))?\s*\)$/.exec(text);
  if (rgb) {
    return {
      r: clamp(Math.round(Number(rgb[1]))),
      g: clamp(Math.round(Number(rgb[2]))),
      b: clamp(Math.round(Number(rgb[3]))),
      a: parseAlpha(rgb[4]),
    };
  }

  const hsl = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.%]+))?\s*\)$/.exec(text);
  if (hsl) {
    const { r, g, b } = hslToRgb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]));
    return { r, g, b, a: parseAlpha(hsl[4]) };
  }

  return null;
}

function parseAlpha(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const value = raw.endsWith('%') ? Number(raw.slice(0, -1)) / 100 : Number(raw);
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}

export function rgbToHex({ r, g, b, a }: Rgb): string {
  const part = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, '0');
  const alpha = a < 1 ? part(a * 255) : '';
  return `#${part(r)}${part(g)}${part(b)}${alpha}`;
}

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] :
    hp < 2 ? [x, c, 0] :
    hp < 3 ? [0, c, x] :
    hp < 4 ? [0, x, c] :
    hp < 5 ? [x, 0, c] : [c, 0, x];

  const m = ln - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/** 相对亮度，按 WCAG 定义。用来判断上面该配黑字还是白字 */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 与纯白 / 纯黑的对比度，判断可读性 */
export function contrastRatio(a: number, b: number): number {
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}
