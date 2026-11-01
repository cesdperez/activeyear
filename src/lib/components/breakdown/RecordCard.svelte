<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconComponentProps } from 'phosphor-svelte';

	let {
		icon: Icon,
		value,
		label,
		activityTitle
	}: {
		icon: Component<IconComponentProps>;
		value: string;
		label: string;
		activityTitle: string;
	} = $props();
</script>

<div class="record-card-compact">
	<div class="record-icon-compact">
		<Icon class="h-14 w-14" weight="fill" />
	</div>
	<div
		class="text-[42px] leading-tight font-black whitespace-nowrap text-[var(--color-text-primary)]"
	>
		{value}
	</div>
	<div
		class="text-[18px] tracking-widest whitespace-nowrap text-[var(--color-text-muted)] uppercase"
	>
		{label}
	</div>
	<div class="mt-2 line-clamp-2 w-full text-[16px] font-medium text-[var(--color-accent)]">
		{activityTitle}
	</div>
</div>
