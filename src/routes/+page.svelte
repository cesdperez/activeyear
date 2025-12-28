<script lang="ts">
	import { appStore } from "$lib/stores/app.svelte.js";
	import FileUpload from "$lib/components/FileUpload.svelte";
	import Dashboard from "$lib/components/Dashboard.svelte";
</script>

<svelte:head>
	<title>ActiveYear — Your 2025 in Sport</title>
	<meta
		name="description"
		content="Generate beautiful shareable infographics from your Garmin activity data. All processing happens in your browser - your data never leaves."
	/>
</svelte:head>

<main class="min-h-screen bg-[var(--color-surface)]">
	{#if appStore.status === "ready"}
		<Dashboard />
	{:else}
		<!-- Upload State -->
		<div
			class="min-h-screen flex flex-col items-center justify-center px-4"
		>
			<div class="text-center mb-8">
				<h1 class="text-4xl md:text-5xl font-bold mb-3 glow-text">
					ActiveYear
				</h1>
				<p class="text-zinc-400 text-lg">Your 2025 in Sport</p>
			</div>

			<div class="w-full max-w-lg">
				<FileUpload />
				<div class="mt-4 text-center">
					<button
						class="text-sm text-zinc-500 hover:text-cyan-400 transition-colors duration-200"
						onclick={() => appStore.loadDemoData()}
					>
						No CSV file? See how it works with demo data
					</button>
				</div>
			</div>

			<div class="mt-12 text-center max-w-md">
				<h2 class="text-sm font-medium text-zinc-400 mb-4">
					How to get your data
				</h2>
				<ol class="text-left text-sm text-zinc-500 space-y-2">
					<li class="flex gap-2">
						<span class="text-cyan-400 font-mono">1.</span>
						Log in at
						<a
							href="https://connect.garmin.com"
							target="_blank"
							class="text-cyan-400 hover:underline"
							>connect.garmin.com</a
						>
					</li>
					<li class="flex gap-2">
						<span class="text-cyan-400 font-mono">2.</span>
						Go to Activities → All Activities
					</li>
					<li class="flex gap-2">
						<span class="text-cyan-400 font-mono">3.</span>
						Scroll down until all 2025 activities are loaded
					</li>
					<li class="flex gap-2">
						<span class="text-cyan-400 font-mono">4.</span>
						Click Export CSV (top-right icon)
					</li>
				</ol>
			</div>
		</div>
	{/if}
</main>

<!-- Noise overlay for texture -->
<div class="noise-overlay"></div>
