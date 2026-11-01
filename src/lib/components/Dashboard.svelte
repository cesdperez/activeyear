<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import ExportPanel from "./ExportPanel.svelte";
	import ConfettiRain from "#lib/components/dashboard/ConfettiRain.svelte";
	import DashboardToolbar from "#lib/components/dashboard/DashboardToolbar.svelte";
	import DashboardHeader from "#lib/components/dashboard/DashboardHeader.svelte";
	import MainStats from "#lib/components/dashboard/MainStats.svelte";
	import ConsistencyStats from "#lib/components/dashboard/ConsistencyStats.svelte";
	import WeeklyPattern from "#lib/components/dashboard/WeeklyPattern.svelte";
	import HighlightsSection from "#lib/components/dashboard/HighlightsSection.svelte";
	import PersonalRecords from "#lib/components/dashboard/PersonalRecords.svelte";
	import SportBreakdown from "#lib/components/dashboard/SportBreakdown.svelte";
</script>

<div
	class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative overflow-x-hidden"
>
	<ConfettiRain />
	<DashboardToolbar />
	<DashboardHeader />
	<MainStats />
	<ConsistencyStats />

	<WeeklyPattern />

	<HighlightsSection />
	<PersonalRecords />

	<SportBreakdown />

	<!-- Export Panel -->
	<ExportPanel />

	<!-- Upload New File -->
	<div class="mt-24 text-center">
		<button
			class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-[var(--color-surface-elevated)] transition-all duration-300 group"
			onclick={() => appStore.reset()}
		>
			<span
				class="group-hover:-rotate-180 transition-transform duration-500"
				>↺</span
			>
			Upload different file
		</button>
	</div>
</div>
