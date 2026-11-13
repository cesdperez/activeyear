<script lang="ts">
	import { untrack } from 'svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import {
		markDashboardEntry,
		pushDashboardEntry,
		startOver
	} from '#lib/components/dashboard/startOver.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { uploadStore } from '#lib/stores/upload.svelte.js';
	import { createHydrated } from '#lib/stores/hydrated.svelte.js';
	import FileUpload from '#lib/components/FileUpload.svelte';
	import Dashboard from '#lib/components/Dashboard.svelte';
	import HomeFaq from '#lib/components/HomeFaq.svelte';
	import ExportGuides from '#lib/components/ExportGuides.svelte';
	import Logotype from '#lib/components/Logotype.svelte';

	let uploading = $state(false);
	const hydrated = createHydrated();
	const demoDisabled = $derived(uploading || !hydrated.current);
	function loadDemo() {
		uploadStore.loadDemoData();
	}

	// A language switch lands on an entry without dashboard state; that must not end the dashboard.
	let switchingLanguage = false;

	$effect(() => {
		if (uploadStore.status === 'ready') untrack(pushDashboardEntry);
	});

	beforeNavigate(({ type, willUnload }) => {
		if (type !== 'popstate' && !willUnload) switchingLanguage = true;
	});

	afterNavigate(({ type }) => {
		if (type !== 'popstate' && uploadStore.status === 'ready' && !page.state.dashboard)
			markDashboardEntry();
		switchingLanguage = false;
	});

	$effect(() => {
		if (page.state.dashboard) return;
		untrack(() => {
			if (uploadStore.status === 'ready' && !switchingLanguage) void startOver();
		});
	});
</script>

<main class="min-h-screen">
	{#if uploadStore.status === 'ready'}
		<Dashboard />
	{:else}
		<div
			class="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center px-4 pt-16 pb-16 md:pt-24"
		>
			<header class="mb-10 text-center">
				<h1><Logotype class="text-[clamp(4.25rem,19vw,7.5rem)]" /></h1>
				<p class="mt-3 text-xl text-[var(--color-text-muted)]">
					{i18n.m.landing.tagline(TARGET_YEAR)}
				</p>
			</header>

			<noscript>
				<p class="mb-6 max-w-md text-center text-sm text-pretty text-[var(--color-text-muted)]">
					{i18n.m.landing.noscript}
				</p>
			</noscript>

			<div class="w-full">
				<div class="mb-4 sm:hidden">
					<p class="mb-3 text-center text-sm text-[var(--color-text-muted)]">
						{i18n.m.landing.mobileHint}
					</p>
					<button
						class="btn-secondary min-h-12 w-full justify-center text-balance"
						disabled={demoDisabled}
						onclick={loadDemo}
						data-testid="demo-data"
					>
						{i18n.m.landing.demo}
					</button>
				</div>
				<FileUpload bind:loading={uploading} />
				<div class="mt-4 hidden text-center sm:block">
					<button
						class="text-sm text-balance text-[var(--color-text-muted)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors duration-200 hover:text-[var(--color-text-primary)] hover:decoration-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
						disabled={demoDisabled}
						onclick={loadDemo}
						data-testid="demo-data"
					>
						{i18n.m.landing.demo}
					</button>
				</div>
				<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
					<span class="text-sm text-[var(--color-text-muted)]">{i18n.m.upload.garminUnits}</span>
					<div role="group" aria-label={i18n.m.upload.garminUnits} class="segmented">
						<button
							aria-pressed={uploadStore.garminUnits === 'metric'}
							disabled={uploading || !hydrated.current}
							onclick={() => (uploadStore.garminUnits = 'metric')}>{i18n.m.upload.metric}</button
						>
						<button
							aria-pressed={uploadStore.garminUnits === 'imperial'}
							disabled={uploading || !hydrated.current}
							onclick={() => (uploadStore.garminUnits = 'imperial')}
							>{i18n.m.upload.imperial}</button
						>
					</div>
				</div>
			</div>

			<section aria-labelledby="guides-heading" class="mt-16 w-full">
				<h2 id="guides-heading" class="display-heading mb-5 text-center text-3xl">
					{i18n.m.landing.how}
				</h2>
				<ExportGuides />
			</section>

			<HomeFaq />
		</div>
	{/if}
</main>
