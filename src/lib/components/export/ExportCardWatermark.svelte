<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
</script>

<div class="mt-auto flex justify-end pt-8">
	<p
		class="card-text-sm font-semibold tracking-[0.02em] whitespace-nowrap text-[var(--color-text-muted)]"
	>
		{appStore.theme === 'lightmile' ? 'activeyear.app · lightmile.nl' : 'activeyear.app'}
	</p>
</div>
