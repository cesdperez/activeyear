<script lang="ts">
	import { exportSettings } from '#lib/stores/exportSettings.svelte.js';
</script>

<div class="mt-auto flex justify-end pt-8">
	<p
		class="card-text-sm font-semibold tracking-[0.02em] whitespace-nowrap text-[var(--color-text-muted)]"
	>
		{exportSettings.theme === 'lightmile' ? 'activeyear.app · lightmile.nl' : 'activeyear.app'}
	</p>
</div>
