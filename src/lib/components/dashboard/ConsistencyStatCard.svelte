<script lang="ts">
	import type { CalendarCheck } from "phosphor-svelte";

	interface Props {
		Icon: typeof CalendarCheck;
		value: number;
		label: string;
		delay: number;
	}

	let { Icon, value, label, delay }: Props = $props();
</script>

<div
	class="stat-card p-4 md:p-6 flex items-center gap-4 group"
	style="animation-delay: {delay}ms"
>
	<div class="text-[var(--color-accent)] shrink-0">
		<Icon class="w-6 h-6 md:w-8 md:h-8" weight="bold" />
	</div>
	<div>
		<div class="text-2xl md:text-3xl font-bold text-white leading-none">
			{value}
		</div>
		<div
			class="text-xs md:text-sm text-[var(--color-text-muted)] font-medium uppercase tracking-wider"
		>
			{label}
		</div>
	</div>
</div>
