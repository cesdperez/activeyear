<script lang="ts">
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { createHydrated } from '#lib/stores/hydrated.svelte.js';
	import FileUpload from '#lib/components/FileUpload.svelte';
	import Dashboard from '#lib/components/Dashboard.svelte';
	import HomeFaq from '#lib/components/HomeFaq.svelte';
	import ExportGuides from '#lib/components/ExportGuides.svelte';

	let uploading = $state(false);
	const hydrated = createHydrated();
</script>

<main class="min-h-screen bg-[var(--color-surface)]">
	{#if appStore.status === 'ready'}
		<Dashboard />
	{:else}
		<!-- Upload State -->
		<div class="flex min-h-screen flex-col items-center justify-center px-4 py-12">
			<div class="mb-8 text-center">
				<h1 class="glow-text mb-3 text-4xl font-bold md:text-5xl">ActiveYear</h1>
				<p class="text-lg text-zinc-400">{i18n.m.landing.tagline(TARGET_YEAR)}</p>
			</div>

			<noscript>
				<p class="mb-6 max-w-md text-center text-sm text-pretty text-zinc-300">
					{i18n.m.landing.noscript}
				</p>
			</noscript>

			<div class="w-full max-w-lg">
				<FileUpload bind:loading={uploading} />
				<div class="mt-4 text-center">
					<button
						class="text-sm text-balance text-zinc-400 transition-colors duration-200 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={uploading || !hydrated.current}
						onclick={() => appStore.loadDemoData()}
					>
						{i18n.m.landing.demo}
					</button>
				</div>
			</div>

			<div class="mt-12 w-full max-w-md text-center">
				<h2 class="mb-4 text-sm font-medium text-zinc-300">{i18n.m.landing.how}</h2>
				<ExportGuides />
			</div>

			<HomeFaq />
		</div>
	{/if}
</main>

<!-- Noise overlay for texture -->
<div class="noise-overlay"></div>
