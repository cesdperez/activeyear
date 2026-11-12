// Ports for this checkout, so several worktrees can run dev, preview and E2E at once.
// Usage: node scripts/ports.ts [--all | --urls]
import { createHash } from 'node:crypto';
import { realpathSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Checkout {
	path: string;
	isMain: boolean;
}

const MAIN_PREVIEW_PORT = 4173;
const MAIN_DEV_PORT = 5173;
// Each worktree takes a preview port and the dev port after it.
const WORKTREE_FIRST_PORT = 41000;
const WORKTREE_SLOTS = 4000;

export function previewPortFor(checkout: Checkout, override?: string): number {
	if (override) return parsePort(override);
	if (checkout.isMain) return MAIN_PREVIEW_PORT;
	return WORKTREE_FIRST_PORT + 2 * (pathHash(checkout.path) % WORKTREE_SLOTS);
}

export function devPortFor(checkout: Checkout, override?: string): number {
	if (!override && checkout.isMain) return MAIN_DEV_PORT;
	return previewPortFor(checkout, override) + 1;
}

export function checkoutAt(root: string): Checkout {
	const git = statSync(join(root, '.git'), { throwIfNoEntry: false });
	// A linked worktree has a .git file; the main checkout has the .git directory.
	return { path: realpathSync(root), isMain: git?.isDirectory() ?? true };
}

function parsePort(value: string): number {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65534) {
		throw new Error(`ACTIVEYEAR_PORT must be a port from 1 to 65534, got "${value}"`);
	}
	return port;
}

function pathHash(path: string): number {
	return createHash('sha256').update(path).digest().readUInt32BE(0);
}

const checkout = checkoutAt(fileURLToPath(new URL('..', import.meta.url)));
export const PREVIEW_PORT = previewPortFor(checkout, process.env.ACTIVEYEAR_PORT);
export const DEV_PORT = devPortFor(checkout, process.env.ACTIVEYEAR_PORT);

if (import.meta.main) {
	const mode = process.argv[2];
	if (mode === '--all') console.log(`${PREVIEW_PORT}\n${DEV_PORT}`);
	else if (mode === '--urls')
		console.log(`preview http://localhost:${PREVIEW_PORT}\ndev     http://localhost:${DEV_PORT}`);
	// A bare number gets ANSI colours under FORCE_COLOR, which Playwright sets for its web server.
	else console.log(String(PREVIEW_PORT));
}
