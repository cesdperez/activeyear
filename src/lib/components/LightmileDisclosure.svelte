<script lang="ts">
	import { onDestroy } from 'svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let open = $state(false);
	let button: HTMLButtonElement;
	let panel: HTMLDivElement;
	let hovered = false;
	let focused = false;
	let openBeforePointer = false;
	let closeTimer: ReturnType<typeof setTimeout>;

	onDestroy(() => clearTimeout(closeTimer));

	function enter(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		hovered = true;
		clearTimeout(closeTimer);
		open = true;
	}

	function leave(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		hovered = false;
		clearTimeout(closeTimer);
		closeTimer = setTimeout(() => {
			if (!hovered && !focused) open = false;
		}, 200);
	}

	function focusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		focused = !!next && (button.contains(next) || panel.contains(next));
		if (!focused && !hovered) {
			clearTimeout(closeTimer);
			open = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !open) return;
		event.preventDefault();
		clearTimeout(closeTimer);
		if (button.contains(document.activeElement) || panel.contains(document.activeElement))
			button.focus();
		open = false;
	}
</script>

<svelte:window onkeydown={keydown} />

<button
	type="button"
	class="lightmile-help"
	bind:this={button}
	aria-label={i18n.m.export.aboutLightmile}
	aria-expanded={open}
	aria-controls="lightmile-info"
	onpointerenter={enter}
	onpointerleave={leave}
	onfocus={() => {
		focused = true;
		clearTimeout(closeTimer);
		open = true;
	}}
	onfocusout={focusOut}
	onpointerdown={() => (openBeforePointer = open)}
	onclick={(event) => {
		open = event.detail === 0 ? !open : !openBeforePointer;
	}}>?</button
>
<div
	id="lightmile-info"
	class="lightmile-info"
	role="group"
	aria-label={i18n.m.export.aboutLightmile}
	hidden={!open}
	bind:this={panel}
	onpointerenter={enter}
	onpointerleave={leave}
	onfocusin={() => (focused = true)}
	onfocusout={focusOut}
>
	{i18n.m.export.lightmileInfo}
	<a href="https://lightmile.nl" target="_blank" rel="noopener noreferrer">lightmile.nl</a>
</div>

<style>
	.lightmile-help {
		position: absolute;
		top: 2px;
		right: 3px;
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-text-dim);
		font-size: 0.75rem;
		border-radius: var(--radius-control);
	}
	.lightmile-help:hover {
		color: var(--color-text-primary);
	}
	.lightmile-info {
		position: absolute;
		z-index: 10;
		top: 100%;
		right: 0;
		width: min(18rem, 85vw);
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-panel);
		background: var(--color-surface-elevated);
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}
	.lightmile-info[hidden] {
		display: none;
	}
	.lightmile-info a {
		color: var(--color-accent);
		text-decoration: underline;
	}
</style>
