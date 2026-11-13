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

			<div class="flex w-full flex-col">
				<p class="order-1 mb-3 text-center text-sm text-[var(--color-text-muted)] sm:hidden">
					{i18n.m.landing.mobileHint}
				</p>
				<div class="order-3 sm:order-1">
					<FileUpload bind:loading={uploading} />
				</div>
				<div class="order-2 mb-4 text-center sm:order-2 sm:mt-4 sm:mb-0">
					<button
						class="btn-secondary min-h-12 w-full justify-center text-balance sm:min-h-0 sm:w-auto sm:border-0 sm:p-0 sm:font-normal sm:underline sm:decoration-[var(--color-border)] sm:underline-offset-4 sm:hover:decoration-[var(--color-accent)]"
						disabled={uploading || !hydrated.current}
						onclick={() => appStore.loadDemoData()}
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
