<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import type { PersonalRecords, Unit } from '#lib/types/index.js';
	import RecordCards from '#lib/components/widgets/RecordCards.svelte';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';

	let { records, unit }: { records: PersonalRecords; unit: Unit } = $props();
</script>

<section>
	<SectionHeading title={i18n.m.dashboard.personalRecords} variant="export" />
	<div class="grid grid-cols-3 gap-5">
		<RecordCards {records} {unit} variant="export" theme={appStore.theme} />
	</div>
</section>
