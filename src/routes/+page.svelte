<script lang="ts">
	import { TARGET_YEAR } from '#lib/constants/time.js';
	import { GARMIN_EXPORT_NOTE, GARMIN_EXPORT_STEPS } from '#lib/data/garminExport.js';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { createHydrated } from '#lib/stores/hydrated.svelte.js';
	import FileUpload from '#lib/components/FileUpload.svelte';
	import Dashboard from '#lib/components/Dashboard.svelte';
	import HomeFaq from '#lib/components/HomeFaq.svelte';

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
				<p class="text-lg text-zinc-400">Your {TARGET_YEAR} in Sport</p>
			</div>

			<noscript>
				<p class="mb-6 max-w-md text-center text-sm text-pretty text-zinc-300">
					ActiveYear needs JavaScript to read your Garmin CSV. Everything is processed in your
					browser and your data never leaves your device, so please enable JavaScript and reload
					this page.
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
						No CSV file? See how it works with demo data
					</button>
				</div>
			</div>

			<div class="mt-12 max-w-md text-center">
				<h2 class="mb-4 text-sm font-medium text-zinc-300">How to get your data</h2>
				<ol class="space-y-2 text-left text-sm text-pretty text-zinc-400">
					{#each GARMIN_EXPORT_STEPS as { text, link }, i (text)}
						<li class="flex gap-2">
							<span class="font-mono text-cyan-400">{i + 1}.</span>
							{text}
							{#if link}
								<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									class="text-cyan-400 hover:underline">{link.label}</a
								>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							{/if}
						</li>
					{/each}
				</ol>
				<p class="mt-4 text-xs text-balance text-zinc-400">{GARMIN_EXPORT_NOTE}</p>
			</div>

			<HomeFaq />
		</div>
	{/if}
</main>

<!-- Noise overlay for texture -->
<div class="noise-overlay"></div>
