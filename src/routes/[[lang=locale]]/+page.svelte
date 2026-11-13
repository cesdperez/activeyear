<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { appStore } from '#lib/stores/app.svelte.js';
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
		appStore.loadDemoData();
	}
</script>

<main class="min-h-screen">
	{#if appStore.status === 'ready'}
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
					>
						{i18n.m.landing.demo}
					</button>
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
