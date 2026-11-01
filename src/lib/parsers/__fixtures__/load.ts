import { readFileSync } from 'fs';

export function loadFixture(name: string): string {
	return readFileSync(new URL(name, import.meta.url), 'utf-8');
}
