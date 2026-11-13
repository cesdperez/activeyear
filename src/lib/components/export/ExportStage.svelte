<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { EXPORT_STAGE_CONTEXT } from '#lib/constants/dom.js';

	let { stage = $bindable(), children }: { stage?: HTMLElement; children: Snippet } = $props();

	setContext(EXPORT_STAGE_CONTEXT, true);
</script>

<!-- Laid out but off-screen, so a card renders for export without changing the visible preview. -->
<div class="export-stage" bind:this={stage} aria-hidden="true" inert>
	{@render children()}
</div>

<style>
	.export-stage {
		position: fixed;
		top: 0;
		left: -10000px;
		pointer-events: none;
	}
</style>
