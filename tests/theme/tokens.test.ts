import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  join(process.cwd(), 'node_modules/@sousa99/homesweethome-theme/theme.css'),
  'utf8',
);

const REQUIRED_TOKENS = [
  'bg',
  'surface',
  'surface-alt',
  'ink',
  'ink-muted',
  'accent',
  'accent-ink',
  'outline',
  'shadow-color',
  'ok',
  'warn',
  'error',
  'info',
  'map-bg',
  'map-line',
  'radius',
  'border-width',
  'shadow-offset',
  'font-display',
  'font-body',
];

function block(selectorStart: string): string {
  const start = css.indexOf(selectorStart);
  if (start === -1) throw new Error(`Missing selector: ${selectorStart}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

function parseVars(source: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of source.matchAll(/--hsh-([a-z-]+):\s*([^;]+);/g)) {
    vars[match[1]!] = match[2]!.trim();
  }
  return vars;
}

const light = parseVars(block(':root,'));
const dark = parseVars(block("[data-theme='dark']"));

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const TEXT_PAIRS: [string, string][] = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['ink-muted', 'surface'],
  ['accent-ink', 'accent'],
  ['ok', 'surface'],
  ['warn', 'surface'],
  ['error', 'surface'],
  ['info', 'surface'],
];

const UI_PAIRS: [string, string][] = [
  ['outline', 'surface'],
  ['outline', 'bg'],
];

const APPEARANCES: [string, Record<string, string>][] = [
  ['light', light],
  ['dark', dark],
];

describe.each(APPEARANCES)('%s appearance', (_name, tokens) => {
  it('defines every token the dashboard consumes', () => {
    for (const token of REQUIRED_TOKENS) {
      expect(tokens[token], `--hsh-${token}`).toBeDefined();
    }
  });

  it('keeps the neo-brutalist shape contract', () => {
    expect(tokens.radius).toBe('0px');
    expect(tokens['border-width']).toBe('0.1875rem');
    expect(tokens['shadow-offset']).toBe('0.375rem');
  });

  it('meets contrast thresholds', () => {
    for (const [fg, bg] of TEXT_PAIRS) {
      expect(contrast(tokens[fg]!, tokens[bg]!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    for (const [fg, bg] of UI_PAIRS) {
      expect(contrast(tokens[fg]!, tokens[bg]!), `${fg} on ${bg}`).toBeGreaterThanOrEqual(3);
    }
  });
});
