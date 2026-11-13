import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import type { Theme } from '#lib/types/index.js';
import { THEME_SURFACES } from './themes.js';

const css = readFileSync(new URL('../../app.css', import.meta.url), 'utf8');

function cssSurface(theme: Theme): string | undefined {
	const selector = theme === 'neon' ? ':root' : `[data-theme='${theme}']`;
	const block = css.split(`\n${selector} {`)[1]?.split('}')[0];
	return block?.match(/--color-surface:\s*([^;]+);/)?.[1];
}

describe('THEME_SURFACES', () => {
	it.each(Object.entries(THEME_SURFACES))(
		'matches the %s surface token in app.css',
		(theme, hex) => {
			expect(cssSurface(theme as Theme)).toBe(hex);
		}
	);
});
