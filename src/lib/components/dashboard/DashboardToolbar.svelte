<script lang="ts">
	import { appStore } from "#lib/stores/app.svelte.js";
	import { Confetti } from "phosphor-svelte";
</script>

<div class="absolute top-4 right-4 md:right-8 z-10 flex items-center gap-2">
	<div
		class="flex p-0.5 bg-[var(--color-surface-elevated)] rounded-full border border-[rgba(255,255,255,0.05)]"
	>
		<button
			class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 {appStore.unit ===
			'km'
				? 'bg-[var(--color-accent)] text-black'
				: 'text-zinc-500 hover:text-zinc-300'}"
			onclick={() => (appStore.unit = "km")}
		>
			km
		</button>
		<button
			class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 {appStore.unit ===
			'miles'
				? 'bg-[var(--color-accent)] text-black'
				: 'text-zinc-500 hover:text-zinc-300'}"
			onclick={() => (appStore.unit = "miles")}
		>
			mi
		</button>
	</div>
	<button
		class="p-2 rounded-full transition-all duration-300 hover:scale-110 {appStore.confettiEnabled
			? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent)] shadow-lg'
			: 'bg-transparent text-zinc-600 hover:text-zinc-400'}"
		onclick={() => (appStore.confettiEnabled = !appStore.confettiEnabled)}
		title={appStore.confettiEnabled
			? "Disable celebration mode"
			: "Enable celebration mode"}
		aria-label="Toggle celebration confetti"
	>
		<Confetti class="w-6 h-6" />
	</button>
</div>
