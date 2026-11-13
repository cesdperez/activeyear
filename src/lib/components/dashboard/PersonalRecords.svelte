<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let { records, unit }: { records: PersonalRecords | null; unit: Unit } = $props();
</script>

{#if records}
	<section data-testid="personal-records" class="mb-20 md:mb-28">
		<SectionHeading title={i18n.m.dashboard.personalRecords} />

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<RecordCards {records} {unit} variant="dashboard" />
		</div>
	</section>
{/if}
