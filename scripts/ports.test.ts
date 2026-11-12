import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { checkoutAt, devPortFor, previewPortFor } from './ports.js';

const main = { path: '/code/activeyear', isMain: true };
const worktree = { path: '/code/worktrees/feature', isMain: false };

describe('previewPortFor', () => {
	it('keeps the default ports in the main checkout', () => {
		expect(previewPortFor(main)).toBe(4173);
		expect(devPortFor(main)).toBe(5173);
	});

	it('derives the same port pair for the same worktree path', () => {
		const port = previewPortFor(worktree);
		expect(previewPortFor({ ...worktree })).toBe(port);
		expect(port).toBeGreaterThanOrEqual(41000);
		expect(port).toBeLessThan(49000);
		expect(devPortFor(worktree)).toBe(port + 1);
	});

	it('gives different worktree paths different ports', () => {
		expect(previewPortFor(worktree)).not.toBe(
			previewPortFor({ path: '/code/worktrees/other', isMain: false })
		);
	});

	it('lets the override win in any checkout', () => {
		expect(previewPortFor(main, '6000')).toBe(6000);
		expect(devPortFor(main, '6000')).toBe(6001);
		expect(previewPortFor(worktree, '6000')).toBe(6000);
	});

	it.each(['abc', '0', '65535', '80.5'])('rejects the override %s', (override) => {
		expect(() => previewPortFor(worktree, override)).toThrow(/ACTIVEYEAR_PORT/);
	});
});

describe('checkoutAt', () => {
	const root = () => mkdtempSync(join(tmpdir(), 'ports-'));

	it('treats a .git directory as the main checkout', () => {
		const dir = root();
		mkdirSync(join(dir, '.git'));
		expect(checkoutAt(dir)).toEqual({ path: realpathSync(dir), isMain: true });
	});

	it('treats a .git file as a linked worktree', () => {
		const dir = root();
		writeFileSync(join(dir, '.git'), 'gitdir: /elsewhere\n');
		expect(checkoutAt(dir)).toEqual({ path: realpathSync(dir), isMain: false });
	});

	it('treats a folder without .git as the main checkout', () => {
		const dir = root();
		expect(checkoutAt(dir)).toEqual({ path: realpathSync(dir), isMain: true });
	});
});
