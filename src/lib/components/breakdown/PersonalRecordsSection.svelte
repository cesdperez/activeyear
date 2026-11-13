<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { PersonalRecords, Unit, Theme } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';

	let { records, unit, theme }: { records: PersonalRecords; unit: Unit; theme: Theme } = $props();

	const count = $derived(
		[records.longestDistance, records.longestDuration, records.biggestBurn].filter(Boolean).length
	);
</script>

<section>
	<SectionHeading title={i18n.m.dashboard.personalRecords} variant="export" />
	<div class="bibs" style:--bibs={count}>
		<RecordCards {records} {unit} variant="export" {theme} />
	</div>
</section>

<style>
	/* Bibs keep a third of the row each, so one or two sit centred instead of leaving a gap. */
	.bibs {
		--gap: 20px;
		display: grid;
		grid-template-columns: repeat(var(--bibs), calc((100% - 2 * var(--gap)) / 3));
		justify-content: center;
		gap: var(--gap);
	}
</style>
