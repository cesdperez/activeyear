<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { ArrowDown } from "phosphor-svelte";
</script>

<header class="text-center mb-16 md:mb-24">
	<h1 class="text-5xl md:text-7xl font-bold mb-6 glow-text tracking-tight">
		Your {appStore.selectedYear}
	</h1>
	<div
		class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-surface-elevated)] border border-[rgba(255,255,255,0.05)]"
	>
		<span class="text-[var(--color-accent)] font-mono font-bold"
			>{appStore.stats?.activityCount}</span
		>
		<span class="text-[var(--color-text-muted)]">activities across</span>
		<span class="text-[var(--color-accent)] font-mono font-bold"
			>{appStore.stats?.activeDays}</span
		>
		<span class="text-[var(--color-text-muted)]">active days</span>
	</div>

	<div class="mt-8">
		<button
			class="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-white transition-colors duration-200 group"
			onclick={() => {
				document
					.getElementById("export-panel")
					?.scrollIntoView({ behavior: "smooth" });
			}}
		>
			<span>Jump to Export</span>
			<ArrowDown
				class="w-4 h-4 group-hover:translate-y-1 transition-transform"
			/>
		</button>
	</div>
</header>
