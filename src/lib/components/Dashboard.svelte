<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { appStore } from '#lib/stores/app.svelte.js';
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
	import UploadAnotherFile from '#lib/components/dashboard/UploadAnotherFile.svelte';
	import SupportLink from '#lib/components/dashboard/SupportLink.svelte';
	import SaveYear from '#lib/components/dashboard/SaveYear.svelte';
	import { useConfettiRain } from '#lib/components/dashboard/confettiRain.svelte.js';

	useConfettiRain();
</script>

<div class="relative mx-auto max-w-6xl overflow-x-hidden px-4 py-12 sm:px-6 md:py-16 lg:px-8">
	<DashboardHeader
		activityCount={appStore.stats?.activityCount ?? 0}
		activeDays={appStore.stats?.activeDays ?? 0}
		skippedRowCount={appStore.skippedRowCount}
		yearSoFar={appStore.yearSoFar}
	/>
	<MainStats
		stats={appStore.stats}
		unit={appStore.unit}
		focus={appStore.summaryMetric}
		yearSoFar={appStore.yearSoFar}
		daysCounted={appStore.daysCounted}
	/>
	<section class="mb-20 md:mb-28">
		<SectionHeading title={i18n.m.common.dayByDay} />
		<YearLane
			variant="dashboard"
			activities={appStore.activities}
			highlights={appStore.highlights}
			records={recordActivities(appStore.records)}
			year={TARGET_YEAR}
			elapsedDays={appStore.daysCounted}
			yearSoFar={appStore.yearSoFar}
		/>
	</section>
	<WeeklyPattern variant="dashboard" pattern={appStore.weeklyPattern} />
	<HighlightsSection />
	<PersonalRecords records={appStore.records} unit={appStore.unit} />
	<SportBreakdown breakdown={appStore.breakdown} metric={appStore.breakdownMetric} />
	<MoreStats activities={appStore.activities} breakdown={appStore.breakdown} unit={appStore.unit} />
	<ExportPanel />
	<div class="mt-24 flex flex-col items-center gap-6">
		<SaveYear />
		<UploadAnotherFile />
		<SupportLink placement="footer" />
	</div>
</div>
