<script lang="ts">
	import ExportPanel from "#lib/components/ExportPanel.svelte";
	import DashboardToolbar from "#lib/components/dashboard/DashboardToolbar.svelte";
	import DashboardHeader from "#lib/components/dashboard/DashboardHeader.svelte";
	import MainStats from "#lib/components/dashboard/MainStats.svelte";
	import ConsistencyStats from "#lib/components/dashboard/ConsistencyStats.svelte";
	import WeeklyPattern from "#lib/components/dashboard/WeeklyPattern.svelte";
	import HighlightsSection from "#lib/components/dashboard/HighlightsSection.svelte";
	import PersonalRecords from "#lib/components/dashboard/PersonalRecords.svelte";
	import SportBreakdown from "#lib/components/dashboard/SportBreakdown.svelte";
	import UploadAnotherFile from "#lib/components/dashboard/UploadAnotherFile.svelte";
	import { useConfettiRain } from "#lib/components/dashboard/confettiRain.svelte.js";

	useConfettiRain();
</script>

<div
	class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative overflow-x-hidden"
>
	<DashboardToolbar />
	<DashboardHeader />
	<MainStats />
	<ConsistencyStats />
	<WeeklyPattern />
	<HighlightsSection />
	<PersonalRecords />
	<SportBreakdown />
	<ExportPanel />
	<UploadAnotherFile />
</div>
