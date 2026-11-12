import { it, expect } from 'vitest';
import type { ComponentProps } from 'svelte';
import WeeklyPattern from './WeeklyPattern.svelte';
import SportDonut from './SportDonut.svelte';
import { sportColorsFor } from '#lib/utils/breakdown.js';

const weeklyDashboard: ComponentProps<typeof WeeklyPattern> = {
	variant: 'dashboard',
	pattern: [0, 0, 0, 0, 0, 0, 0]
};
// @ts-expect-error Export widgets require a theme.
const weeklyExport: ComponentProps<typeof WeeklyPattern> = {
	variant: 'export',
	pattern: [0, 0, 0, 0, 0, 0, 0]
};
// @ts-expect-error Export widgets require a theme.
const donutExport: ComponentProps<typeof SportDonut> = {
	variant: 'export',
	sports: [],
	colors: sportColorsFor([]),
	metric: 'count'
};
it('accepts dashboard props without a theme', () => {
	expect(weeklyDashboard.variant).toBe('dashboard');
	expect(weeklyExport.variant).toBe('export');
	expect(donutExport.variant).toBe('export');
});
