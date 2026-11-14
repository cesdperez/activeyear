<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Question } from 'phosphor-svelte';
	import { i18n } from '#lib/i18n/i18n.svelte.js';

	let open = $state(false);
	let button: HTMLButtonElement;
	let panel: HTMLDivElement;
	let hovered = false;
	let focused = false;
	// Opened by a click or tap, so it stays open when the pointer leaves.
	let pinned = false;
	let pinnedBeforePointer = false;
	let closeTimer: ReturnType<typeof setTimeout>;

	onDestroy(() => clearTimeout(closeTimer));

	$effect(() => {
		if (open) panel.scrollIntoView({ block: 'nearest' });
	});

	function close() {
		clearTimeout(closeTimer);
		pinned = false;
		open = false;
	}

	function inside(node: Node | null): boolean {
		return !!node && (button.contains(node) || panel.contains(node));
	}

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
			if (!hovered && !focused && !pinned) open = false;
		}, 200);
	}

	function focusOut(event: FocusEvent) {
		focused = inside(event.relatedTarget as Node | null);
		if (!focused && !hovered) close();
	}

	// iOS Safari does not focus a tapped button, so a tap elsewhere never fires focusout.
	function pointerDownOutside(event: PointerEvent) {
		if (open && !inside(event.target as Node)) close();
	}

	function toggle(event: MouseEvent) {
		// detail is 0 for Enter and Space, which act on what is shown, not on the pin.
		pinned = event.detail === 0 ? !open : !pinnedBeforePointer;
		open = pinned;
	}

	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !open) return;
		event.preventDefault();
		if (inside(document.activeElement)) button.focus();
		close();
	}
</script>

<svelte:window onkeydown={keydown} onpointerdown={pointerDownOutside} />

<!-- A sibling of the theme button, laid over its corner: a button inside a button is invalid HTML. -->
<div class="lightmile-disclosure">
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
		onpointerdown={() => (pinnedBeforePointer = pinned)}
		onclick={toggle}
	>
		<Question class="h-4 w-4" weight="bold" aria-hidden="true" />
	</button>
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
</div>

<style>
	/* Positioned against the theme tile's cell, so the button sits in the tile and the panel under it. */
	.lightmile-disclosure {
		display: contents;
	}
	.lightmile-help {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		color: var(--color-text-dim);
		border-radius: var(--radius-control);
	}
	@media (pointer: coarse) {
		.lightmile-help {
			top: 0;
			right: 0;
			width: 2.75rem;
			height: 2.75rem;
		}
	}
	@media (hover: hover) {
		.lightmile-help:hover {
			color: var(--color-text-primary);
		}
	}
	.lightmile-help[aria-expanded='true'] {
		color: var(--color-text-primary);
	}
	.lightmile-info {
		position: absolute;
		z-index: 10;
		top: 100%;
		right: 0;
		width: min(18rem, 85vw);
		margin-top: 0.25rem;
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
