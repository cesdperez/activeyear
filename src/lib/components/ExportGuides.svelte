<script lang="ts">
	import { garminExportNote, garminExportSteps } from '#lib/data/garminExport.js';
	import { stravaExportNote, stravaExportSteps } from '#lib/data/stravaExport.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { ExportStep } from '#lib/types/index.js';
	import ExternalLink from '#lib/components/ExternalLink.svelte';
	let selected = $state<'garmin' | 'strava'>('garmin');
	let garminTab: HTMLButtonElement;
	let stravaTab: HTMLButtonElement;
	function handleKeydown(event: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		selected =
			event.key === 'Home'
				? 'garmin'
				: event.key === 'End'
					? 'strava'
					: selected === 'garmin'
						? 'strava'
						: 'garmin';
		(selected === 'garmin' ? garminTab : stravaTab).focus();
	}
</script>

{#snippet exportGuide(steps: ExportStep[], note: string)}
	<ol class="steps">
		{#each steps as { text, link }, i (text)}
			<li>
				<span class="step-number">{i + 1}</span>
				<span>
					{text}
					{#if link}
						<ExternalLink href={link.href}>{link.label}</ExternalLink>
					{/if}
				</span>
			</li>
		{/each}
	</ol>
	<p class="note">{note}</p>
{/snippet}

<div class="flex justify-center">
	<div role="tablist" aria-label={i18n.m.faq.guidesAria} class="segmented mb-5">
		<button
			onkeydown={handleKeydown}
			bind:this={garminTab}
			id="garmin-tab"
			role="tab"
			type="button"
			aria-selected={selected === 'garmin'}
			aria-controls="garmin-panel"
			tabindex={selected === 'garmin' ? 0 : -1}
			onclick={() => (selected = 'garmin')}
			class="min-h-11 px-5">Garmin Connect</button
		>
		<button
			onkeydown={handleKeydown}
			bind:this={stravaTab}
			id="strava-tab"
			role="tab"
			type="button"
			aria-selected={selected === 'strava'}
			aria-controls="strava-panel"
			tabindex={selected === 'strava' ? 0 : -1}
			onclick={() => (selected = 'strava')}
			class="min-h-11 px-5">Strava</button
		>
	</div>
</div>
<div id="garmin-panel" role="tabpanel" aria-labelledby="garmin-tab" hidden={selected !== 'garmin'}>
	{@render exportGuide(garminExportSteps(i18n.locale), garminExportNote(i18n.locale))}
</div>
<div id="strava-panel" role="tabpanel" aria-labelledby="strava-tab" hidden={selected !== 'strava'}>
	{@render exportGuide(stravaExportSteps(i18n.locale), stravaExportNote(i18n.locale))}
</div>

<style>
	.steps {
		width: min(100%, 32rem);
		margin-inline: auto;
		display: grid;
		gap: 0.75rem;
		font-size: 0.9375rem;
		text-wrap: pretty;
		color: var(--color-text-muted);
	}

	.steps li {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		align-items: start;
	}

	.step-number {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 800;
		line-height: 1.4rem;
		font-variant-numeric: tabular-nums;
		color: var(--color-accent);
	}

	.steps :global(a) {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (hover: hover) {
		.steps :global(a:hover) {
			color: var(--color-text-primary);
		}
	}

	.note {
		width: min(100%, 32rem);
		margin: 1rem auto 0;
		padding-left: 2rem;
		font-size: 0.8125rem;
		color: var(--color-text-dim);
	}
</style>
