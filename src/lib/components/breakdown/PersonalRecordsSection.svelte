<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { PersonalRecords, Unit, Theme } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';

	let { records, unit, theme }: { records: PersonalRecords; unit: Unit; theme: Theme } = $props();
</script>

<section>
	<SectionHeading title={i18n.m.dashboard.personalRecords} variant="export" />
	<div class="grid grid-cols-3 gap-5">
		<RecordCards {records} {unit} variant="export" {theme} />
	</div>
</section>
