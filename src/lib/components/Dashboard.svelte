<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import ExportPanel from '#lib/components/ExportPanel.svelte';
	import DashboardToolbar from '#lib/components/dashboard/DashboardToolbar.svelte';
	import DashboardHeader from '#lib/components/dashboard/DashboardHeader.svelte';
	import MainStats from '#lib/components/dashboard/MainStats.svelte';
	import ConsistencyStats from '#lib/components/widgets/ConsistencyStats.svelte';
	import WeeklyPattern from '#lib/components/dashboard/WeeklyPattern.svelte';
	import HighlightsSection from '#lib/components/dashboard/HighlightsSection.svelte';
	import PersonalRecords from '#lib/components/dashboard/PersonalRecords.svelte';
	import SportBreakdown from '#lib/components/dashboard/SportBreakdown.svelte';
	import UploadAnotherFile from '#lib/components/dashboard/UploadAnotherFile.svelte';
	import { useConfettiRain } from '#lib/components/dashboard/confettiRain.svelte.js';

	useConfettiRain();
</script>

<div class="relative mx-auto max-w-7xl overflow-x-hidden px-4 py-12 sm:px-6 md:py-20 lg:px-8">
	<DashboardToolbar />
	<DashboardHeader />
	<MainStats />
	<ConsistencyStats
		variant="dashboard"
		activeDays={appStore.stats?.activeDays ?? 0}
		longestStreak={appStore.stats?.longestStreak ?? 0}
	/>
	<WeeklyPattern />
	<HighlightsSection />
	<PersonalRecords />
	<SportBreakdown />
	<ExportPanel />
	<UploadAnotherFile />
</div>
