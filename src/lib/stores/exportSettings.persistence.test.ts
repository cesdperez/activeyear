import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/env', () => ({ browser: true }));
vi.mock('#lib/analytics/track.js', () => ({ track: vi.fn() }));

describe('theme persistence', () => {
	const getItem = vi.fn();
	const setItem = vi.fn();

	beforeEach(() => {
		vi.resetModules();
		getItem.mockReset();
		setItem.mockReset();
		vi.stubGlobal('localStorage', { getItem, setItem });
	});

	afterEach(() => vi.unstubAllGlobals());

	it('falls back to neon for an unknown theme', async () => {
		getItem.mockReturnValue('unknown');
		const { exportSettings } = await import('./exportSettings.svelte.js');
		expect(exportSettings.theme).toBe('neon');
	});

	it('falls back to neon when storage cannot be read', async () => {
		getItem.mockImplementation(() => {
			throw new Error('unavailable');
		});
		const { exportSettings } = await import('./exportSettings.svelte.js');
		expect(exportSettings.theme).toBe('neon');
	});

	it('keeps the selected theme when storage cannot be written', async () => {
		setItem.mockImplementation(() => {
			throw new Error('unavailable');
		});
		const { exportSettings } = await import('./exportSettings.svelte.js');
		expect(() => {
			exportSettings.theme = 'lightmile';
		}).not.toThrow();
		expect(exportSettings.theme).toBe('lightmile');
	});

	it('keeps the selected and stored theme on reset', async () => {
		const { exportSettings } = await import('./exportSettings.svelte.js');
		const { uploadStore } = await import('./upload.svelte.js');
		exportSettings.theme = 'lightmile';
		setItem.mockClear();
		uploadStore.reset();
		expect(exportSettings.theme).toBe('lightmile');
		expect(setItem).not.toHaveBeenCalled();
	});
});
