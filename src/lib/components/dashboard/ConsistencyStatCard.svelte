<script lang="ts">
	import type { CalendarCheck } from 'phosphor-svelte';

	interface Props {
		Icon: typeof CalendarCheck;
		value: number;
		label: string;
		delay: number;
	}

	let { Icon, value, label, delay }: Props = $props();
</script>

<div class="stat-card group flex items-center gap-4 p-4 md:p-6" style="animation-delay: {delay}ms">
	<div class="shrink-0 text-[var(--color-accent)]">
		<Icon class="h-6 w-6 md:h-8 md:w-8" weight="bold" />
	</div>
	<div>
		<div class="text-2xl leading-none font-bold text-white md:text-3xl">
			{value}
		</div>
		<div
			class="text-xs font-medium tracking-wider text-[var(--color-text-muted)] uppercase md:text-sm"
		>
			{label}
		</div>
	</div>
</div>
