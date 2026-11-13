import { describe, it, expect } from 'vitest';
import { exportFileStem, nameFontSize, timelineGap } from './export.js';

describe('exportFileStem', () => {
	it.each([
		['', 'activeyear-2026'],
		['Ana', 'ana-2026'],
		['Ana   María', 'ana-maria-2026'],
		['山田', 'activeyear-2026']
	])('names the files for %j as %j', (name, stem) => {
		expect(exportFileStem(name, 2026)).toBe(stem);
	});
});

describe('nameFontSize', () => {
	it('keeps short names large and shrinks long ones', () => {
		expect(nameFontSize('Ana')).toBe(42);
		expect(nameFontSize('Wolfgang Amadeus Mozart')).toBe(32);
	});
});

describe('timelineGap', () => {
	it('spreads the free height between the items', () => {
		expect(timelineGap(1000, 600, 5)).toBe(100);
	});

	it.each([
		['packed', 1000, 990, 5, 32],
		['sparse', 1000, 200, 2, 160],
		['single', 1000, 200, 1, 32]
	])('clamps a %s list', (_, available, items, count, gap) => {
		expect(timelineGap(available, items, count)).toBe(gap);
	});
});

describe('theme font CSS', () => {
	it('inlines only the families used by each theme', async () => {
		const { vi } = await import('vitest');
		class Face {
			parentStyleSheet = null;
			style: { getPropertyValue: (name: string) => string };
			constructor(family: string) {
				this.style = {
					getPropertyValue: (name) =>
						name === 'font-family' ? `"${family}"` : name === 'src' ? 'url(font.woff2)' : ''
				};
			}
		}
		class Reader {
			result = 'data:font/woff2;base64,AA==';
			onload = () => {};
			readAsDataURL() {
				this.onload();
			}
		}
		vi.stubGlobal('CSSFontFaceRule', Face);
		vi.stubGlobal('CSSGroupingRule', class {});
		vi.stubGlobal('FileReader', Reader);
		vi.stubGlobal('document', {
			baseURI: 'https://example.com/',
			styleSheets: [
				{
					cssRules: ['Big Shoulders Display', 'Archivo', 'Press Start 2P', 'VT323', 'Outfit'].map(
						(family) => new Face(family)
					)
				}
			]
		});
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob() }));
		try {
			const { inlinedFontFaceCss } = await import('./fonts.js');
			for (const [theme, expected] of Object.entries({
				neon: ['Big Shoulders Display', 'Archivo'],
				minimalist: ['Big Shoulders Display', 'Archivo'],
				retro: ['Press Start 2P', 'VT323', 'Big Shoulders Display'],
				classic: ['Outfit', 'Big Shoulders Display'],
				synthwave: ['Outfit', 'Big Shoulders Display']
			}) as [import('#lib/types/index.js').Theme, string[]][]) {
				const css = await inlinedFontFaceCss(theme);
				for (const family of [
					'Big Shoulders Display',
					'Archivo',
					'Press Start 2P',
					'VT323',
					'Outfit'
				]) {
					expect(css.includes(`font-family: "${family}"`)).toBe(expected.includes(family));
				}
			}
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
