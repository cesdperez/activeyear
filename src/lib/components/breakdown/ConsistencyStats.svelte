<script lang="ts">
	import { CalendarCheck, Lightning } from 'phosphor-svelte';
	import { activeDaysPercent } from '#lib/utils/breakdown.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import ConsistencyCard from './ConsistencyCard.svelte';

	let { activeDays, longestStreak }: { activeDays: number; longestStreak: number } = $props();

	let yearPercent = $derived(activeDaysPercent(activeDays, TARGET_YEAR));
</script>

<div class="mb-16 grid grid-cols-2 gap-8">
	<ConsistencyCard
		value={activeDays}
		ringStroke="var(--color-accent)"
		ringDashArray="{yearPercent * 3.27} 327"
		ringClass="progress-ring"
		icon={CalendarCheck}
		colorClass="text-[var(--color-accent)]"
		label="Active Days"
		caption="{Math.round(yearPercent)}% of the year"
	/>
	<ConsistencyCard
		value={longestStreak}
		ringStroke="#ff6b6b"
		ringDashArray="20 10"
		ringClass="streak-ring"
		icon={Lightning}
		colorClass="text-[#ff6b6b]"
		label="Day Streak"
		caption="most consecutive active days"
	/>
</div>
