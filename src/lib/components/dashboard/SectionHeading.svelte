<script lang="ts">
	interface Props {
		title: string;
		class?: string;
	}

	let { title, class: className = "mb-8" }: Props = $props();
</script>

<div class="flex items-end gap-4 {className}">
	<h2 class="text-3xl font-bold tracking-tight">{title}</h2>
	<div
		class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
	></div>
</div>
