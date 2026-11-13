<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let { records, unit }: { records: PersonalRecords | null; unit: Unit } = $props();
	const count = $derived(
		records
			? [records.longestDistance, records.longestDuration, records.biggestBurn].filter(Boolean)
					.length
			: 0
	);
</script>

{#if records}
	<section data-testid="personal-records" class="mb-20 md:mb-28">
		<SectionHeading title={i18n.m.dashboard.personalRecords} />

		<div class="bibs" style:--count={count}>
			<RecordCards {records} {unit} variant="dashboard" />
		</div>
	</section>
{/if}

<style>
	.bibs {
		display: grid;
		gap: 1rem;
	}

	/* Each bib keeps its three-column width, and fewer bibs sit centred. */
	@media (min-width: 640px) {
		.bibs {
			grid-template-columns: repeat(var(--count), minmax(0, 1fr));
			max-width: calc((100% - 2rem) * var(--count) / 3 + (var(--count) - 1) * 1rem);
			margin-inline: auto;
		}
	}
</style>
