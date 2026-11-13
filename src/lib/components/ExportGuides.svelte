<script lang="ts">
	import { garminExportNote, garminExportSteps } from '#lib/data/garminExport.js';
	import { stravaExportNote, stravaExportSteps } from '#lib/data/stravaExport.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import type { ExportStep } from '#lib/types/index.js';
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
	<ol class="space-y-2 text-left text-sm text-pretty text-zinc-400">
		{#each steps as { text, link }, i (text)}
			<li class="flex gap-2">
				<span class="font-mono text-cyan-400">{i + 1}.</span>
				{text}
				{#if link}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						class="text-cyan-400 hover:underline">{link.label}</a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/if}
			</li>
		{/each}
	</ol>
	<p class="mt-4 text-xs text-balance text-zinc-400">{note}</p>
{/snippet}

<div
	role="tablist"
	aria-label={i18n.m.faq.guidesAria}
	class="mb-4 inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 p-1"
>
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
		class="min-h-11 rounded-full px-4 text-xs font-medium tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 {selected ===
		'garmin'
			? 'bg-cyan-400/10 text-cyan-400'
			: 'text-zinc-400 hover:text-zinc-200'}">Garmin Connect</button
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
		class="min-h-11 rounded-full px-4 text-xs font-medium tracking-wide uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 {selected ===
		'strava'
			? 'bg-cyan-400/10 text-cyan-400'
			: 'text-zinc-400 hover:text-zinc-200'}">Strava</button
	>
</div>
<div id="garmin-panel" role="tabpanel" aria-labelledby="garmin-tab" hidden={selected !== 'garmin'}>
	{@render exportGuide(garminExportSteps(i18n.locale), garminExportNote(i18n.locale))}
</div>
<div id="strava-panel" role="tabpanel" aria-labelledby="strava-tab" hidden={selected !== 'strava'}>
	{@render exportGuide(stravaExportSteps(i18n.locale), stravaExportNote(i18n.locale))}
</div>
