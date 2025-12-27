<script lang="ts">
	interface Props {
		value: string;
		label: string;
		detail?: string;
		icon?: string;
		highlight?: boolean;
	}

	let { value, label, detail, icon, highlight = false }: Props = $props();
</script>

<div class="stat-card p-6" class:glow-border={highlight}>
	{#if icon}
		<div class="text-2xl mb-2">{icon}</div>
	{/if}
	
	<div class="stat-value text-3xl md:text-4xl text-white mb-1 glow-text">
		{value}
	</div>
	
	<div class="stat-label">
		{label}
	</div>
	
	{#if detail}
		<div class="mt-2 text-sm text-zinc-500">
			{detail}
		</div>
	{/if}
</div>
