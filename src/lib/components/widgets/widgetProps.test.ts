import { it, expectTypeOf } from 'vitest';
import type { ComponentProps } from 'svelte';
import type { SportColors } from '#lib/utils/breakdown.js';
import type { WeeklyPattern as Week } from '#lib/types/index.js';
import type WeeklyPattern from './WeeklyPattern.svelte';
import type SportDonut from './SportDonut.svelte';

// Checked by `pnpm check`; at runtime the assertions are no-ops.
it('requires a theme for export widgets but not dashboard widgets', () => {
	expectTypeOf<{ variant: 'dashboard'; pattern: Week }>().toExtend<
		ComponentProps<typeof WeeklyPattern>
	>();
	expectTypeOf<{ variant: 'export'; theme: 'neon'; pattern: Week }>().toExtend<
		ComponentProps<typeof WeeklyPattern>
	>();
	expectTypeOf<{ variant: 'export'; pattern: Week }>().not.toExtend<
		ComponentProps<typeof WeeklyPattern>
	>();
	expectTypeOf<{
		variant: 'export';
		sports: [];
		colors: SportColors;
		metric: 'count';
	}>().not.toExtend<ComponentProps<typeof SportDonut>>();
});
