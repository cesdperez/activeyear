<script lang="ts">
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let { records, unit }: { records: PersonalRecords | null; unit: Unit } = $props();
</script>

{#if records}
	<section data-testid="personal-records" class="mb-16">
		<SectionHeading title="Personal Records" />

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<RecordCards {records} {unit} variant="dashboard" delay={450} />
		</div>
	</section>
{/if}
