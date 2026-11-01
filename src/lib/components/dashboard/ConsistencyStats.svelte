<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import { CalendarCheck, Lightning } from 'phosphor-svelte';
	import ConsistencyStatCard from './ConsistencyStatCard.svelte';
</script>

<div class="mx-auto mb-16 grid max-w-2xl grid-cols-2 gap-4 md:gap-6">
	<ConsistencyStatCard
		Icon={CalendarCheck}
		value={appStore.stats?.activeDays ?? 0}
		label="Active Days"
		delay={350}
	/>
	<ConsistencyStatCard
		Icon={Lightning}
		value={appStore.stats?.longestStreak ?? 0}
		label="most consecutive active days"
		delay={400}
	/>
</div>
