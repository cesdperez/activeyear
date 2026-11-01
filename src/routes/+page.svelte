<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import FileUpload from '#lib/components/FileUpload.svelte';
	import Dashboard from '#lib/components/Dashboard.svelte';
</script>

<main class="min-h-screen bg-[var(--color-surface)]">
	{#if appStore.status === 'ready'}
		<Dashboard />
	{:else}
		<!-- Upload State -->
		<div class="flex min-h-screen flex-col items-center justify-center px-4">
			<div class="mb-8 text-center">
				<h1 class="glow-text mb-3 text-4xl font-bold md:text-5xl">ActiveYear</h1>
				<p class="text-lg text-zinc-400">Your {appStore.selectedYear} in Sport</p>
			</div>

			<div class="w-full max-w-lg">
				<FileUpload />
				<div class="mt-4 text-center">
					<button
						class="text-sm text-zinc-500 transition-colors duration-200 hover:text-cyan-400"
						onclick={() => appStore.loadDemoData()}
					>
						No CSV file? See how it works with demo data
					</button>
				</div>
			</div>

			<div class="mt-12 max-w-md text-center">
				<h2 class="mb-4 text-sm font-medium text-zinc-400">How to get your data</h2>
				<ol class="space-y-2 text-left text-sm text-zinc-500">
					<li class="flex gap-2">
						<span class="font-mono text-cyan-400">1.</span>
						Log in at
						<a
							href="https://connect.garmin.com"
							target="_blank"
							class="text-cyan-400 hover:underline">connect.garmin.com</a
						>
					</li>
					<li class="flex gap-2">
						<span class="font-mono text-cyan-400">2.</span>
						Go to Activities → All Activities
					</li>
					<li class="flex gap-2">
						<span class="font-mono text-cyan-400">3.</span>
						Scroll down until all {appStore.selectedYear} activities are loaded
					</li>
					<li class="flex gap-2">
						<span class="font-mono text-cyan-400">4.</span>
						Click Export CSV (top-right icon)
					</li>
				</ol>
			</div>
		</div>
	{/if}
</main>

<!-- Noise overlay for texture -->
<div class="noise-overlay"></div>
