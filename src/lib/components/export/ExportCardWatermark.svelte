<script lang="ts">
	import type { Theme } from '#lib/types/index.js';
	let { theme }: { theme: Theme } = $props();
</script>

<div class="mt-auto flex justify-end pt-8">
	<p
		class="card-text-sm font-semibold tracking-[0.02em] whitespace-nowrap text-[var(--color-text-muted)]"
	>
		{theme === 'lightmile' ? 'activeyear.app · lightmile.nl' : 'activeyear.app'}
	</p>
</div>
