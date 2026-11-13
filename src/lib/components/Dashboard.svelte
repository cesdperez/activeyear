<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { Lightning } from 'phosphor-svelte';
	import { track } from '#lib/analytics/track.js';
	import { KOFI_URL } from '#lib/constants/site.js';
	import { UPLOAD_ZONE_ID } from '#lib/constants/dom.js';
	import Logotype from '#lib/components/Logotype.svelte';
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
	let headerVisible = $state(true);
	let supportVisible = $state(false);

	async function backToStart() {
		appStore.reset();
		await tick();
		window.scrollTo({ top: 0, behavior: 'instant' });
		document.getElementById(UPLOAD_ZONE_ID)?.focus();
	}

	onMount(() => {
		const visible = new SvelteSet<Element>();
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.target.hasAttribute('data-dashboard-header')) {
					headerVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
				} else if (entry.isIntersecting) visible.add(entry.target);
				else visible.delete(entry.target);
			}
			supportVisible = visible.size > 0;
		});
		const observe = () => {
			document
				.querySelectorAll('[data-dashboard-header], [data-support-placement]')
				.forEach((el) => observer.observe(el));
		};
		observe();
		const mutations = new MutationObserver(() => {
			for (const el of visible) if (!el.isConnected) visible.delete(el);
			supportVisible = visible.size > 0;
			observe();
		});
		mutations.observe(document.body, { childList: true, subtree: true });
		return () => {
			mutations.disconnect();
			observer.disconnect();
		};
	});
</script>

<button
	type="button"
	aria-label={i18n.m.dashboard.backToStart}
	disabled={appStore.isExporting}
	onclick={backToStart}
	class="absolute top-5 left-4 z-20 disabled:opacity-50 md:left-8"
>
	<Logotype class="text-xl" />
</button>
<div class="relative mx-auto max-w-6xl overflow-x-hidden px-4 py-12 sm:px-6 md:py-16 lg:px-8">
	<div data-dashboard-header>
		<DashboardHeader
			activityCount={appStore.stats?.activityCount ?? 0}
			activeDays={appStore.stats?.activeDays ?? 0}
			skippedRowCount={appStore.skippedRowCount}
		/>
	</div>
	<MainStats stats={appStore.stats} unit={appStore.unit} focus={appStore.summaryMetric} />
	<section class="mb-20 md:mb-28">
		<SectionHeading title={i18n.m.common.dayByDay} />
		<YearLane
			variant="dashboard"
			activities={appStore.activities}
			highlights={appStore.highlights}
			records={recordActivities(appStore.records)}
			year={TARGET_YEAR}
		/>
	</section>
	<WeeklyPattern variant="dashboard" pattern={appStore.weeklyPattern} />
	<HighlightsSection />
	<PersonalRecords records={appStore.records} unit={appStore.unit} />
	<SportBreakdown breakdown={appStore.breakdown} metric={appStore.breakdownMetric} />
	<MoreStats activities={appStore.activities} breakdown={appStore.breakdown} unit={appStore.unit} />
	<ExportPanel />
	<div class="mt-24 flex flex-col items-center gap-6">
		<div class="grid w-full max-w-xl items-start gap-4 sm:grid-cols-2">
			<SaveYear />
			<UploadAnotherFile />
		</div>
		<SupportLink placement="footer" />
	</div>
</div>

{#if !headerVisible && !supportVisible && !appStore.isExporting}
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href={KOFI_URL}
		target="_blank"
		rel="noopener"
		onclick={() => track('support_clicked', 'floating')}
		class="fixed z-30 inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm font-semibold text-[var(--color-accent)] shadow-lg"
		style="right: max(1rem, env(safe-area-inset-right)); bottom: max(1rem, env(safe-area-inset-bottom));"
	>
		<Lightning class="h-4 w-4" weight="bold" aria-hidden="true" />{i18n.m.dashboard.buyMeAGel}<span
			class="sr-only"
		>
			{i18n.m.dashboard.opensKofi}</span
		>
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
