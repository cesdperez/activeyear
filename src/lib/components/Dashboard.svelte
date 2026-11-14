<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { yearData } from '#lib/stores/yearData.svelte.js';
	import { highlightsStore } from '#lib/stores/highlights.svelte.js';
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
	import { uploadStore } from '#lib/stores/upload.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { recordActivities } from '#lib/utils/yearLane.js';
	import ExportPanel from '#lib/components/ExportPanel.svelte';
	import DashboardHeader from '#lib/components/dashboard/DashboardHeader.svelte';
	import MainStats from '#lib/components/dashboard/MainStats.svelte';
	import SectionHeading from '#lib/components/dashboard/SectionHeading.svelte';
	import YearLane from '#lib/components/widgets/YearLane.svelte';
	import WeeklyPattern from '#lib/components/widgets/WeeklyPattern.svelte';
	import HighlightsSection from '#lib/components/dashboard/HighlightsSection.svelte';
	import PersonalRecords from '#lib/components/dashboard/PersonalRecords.svelte';
	import SportBreakdown from '#lib/components/dashboard/SportBreakdown.svelte';
	import MoreStats from '#lib/components/dashboard/MoreStats.svelte';
	import SupportLink from '#lib/components/dashboard/SupportLink.svelte';
	import SaveYear from '#lib/components/dashboard/SaveYear.svelte';
	import FloatingSupportLink from '#lib/components/dashboard/FloatingSupportLink.svelte';
	import DashboardFileDrop from '#lib/components/dashboard/DashboardFileDrop.svelte';
	import { useConfettiRain } from '#lib/components/dashboard/confettiRain.svelte.js';
	import { observeBusyArea } from '#lib/stores/supportVisibility.svelte.js';

	useConfettiRain();
	let header: HTMLDivElement;
</script>

<div class="relative mx-auto max-w-6xl overflow-x-hidden px-4 py-12 sm:px-6 md:py-16 lg:px-8">
	<div bind:this={header}>
		<DashboardHeader
			activityCount={yearData.stats?.activityCount ?? 0}
			activeDays={yearData.stats?.activeDays ?? 0}
			skippedRowCount={uploadStore.skippedRowCount}
			cutShort={yearData.cutShort}
			yearSoFar={yearData.yearSoFar}
			demo={yearData.source === null}
		/>
	</div>
	<MainStats
		stats={yearData.stats}
		unit={exportSettings.unit}
		focus={exportSettings.summaryMetric}
		yearSoFar={yearData.yearSoFar}
		daysCounted={yearData.daysCounted}
	/>
	<section class="mb-20 md:mb-28">
		<SectionHeading title={i18n.m.common.dayByDay} />
		<YearLane
			variant="dashboard"
			activities={yearData.activities}
			highlights={highlightsStore.highlights}
			records={recordActivities(yearData.records)}
			year={TARGET_YEAR}
			elapsedDays={yearData.daysCounted}
			yearSoFar={yearData.yearSoFar}
		/>
	</section>
	<WeeklyPattern variant="dashboard" pattern={yearData.weeklyPattern} />
	<HighlightsSection />
	<PersonalRecords records={yearData.records} unit={exportSettings.unit} />
	<SportBreakdown breakdown={yearData.breakdown} metric={exportSettings.breakdownMetric} />
	<MoreStats
		activities={yearData.activities}
		activeDays={yearData.stats?.activeDays ?? 0}
		breakdown={yearData.breakdown}
		unit={exportSettings.unit}
	/>
	<div {@attach observeBusyArea}>
		<ExportPanel />
	</div>
	<div class="mt-24 flex flex-col items-center gap-6">
		<div class="w-full max-w-xs">
			<SaveYear />
		</div>
		<SupportLink placement="footer" />
	</div>
</div>

<FloatingSupportLink {header} />
<DashboardFileDrop />
