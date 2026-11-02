import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

const PALETTE_UTILITY =
  /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|placeholder|decoration|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|primary)(?:-\d{2,3})?(?:\/\d{1,3})?\b/g;

const ROUNDED = /(?<![\w-])rounded(?:-(?:sm|md|lg|xl|2xl|3xl))?(?![\w-])/g;
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:rgb|hsl|oklch)\(/g;

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (
      entry.isFile() &&
      entry.name.endsWith('.tsx') &&
      !entry.name.includes('.test.') &&
      !entry.name.includes('.stories.')
    ) {
      files.push(path);
    }
  }
  return files;
}

describe('dashboard palette guard', () => {
  it('uses semantic theme tokens instead of raw palette utilities and color literals', () => {
    const violations: string[] = [];

    for (const file of walk(join(ROOT, 'src'))) {
      const source = readFileSync(file, 'utf8');
      source.split('\n').forEach((line, index) => {
        const location = `${relative(ROOT, file)}:${index + 1}`;
        for (const match of line.matchAll(PALETTE_UTILITY)) {
          violations.push(`${location} ${match[0]} (raw palette utility)`);
        }
        for (const match of line.matchAll(ROUNDED)) {
          violations.push(`${location} ${match[0]} (non-brutalist radius)`);
        }
        for (const match of line.matchAll(RAW_COLOR)) {
          violations.push(`${location} ${match[0]} (raw color literal)`);
        }
      });
    }

    expect(violations).toEqual([]);
  });
});
