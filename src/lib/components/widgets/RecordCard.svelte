<script lang="ts">
	import type { WidgetVariant, WidgetVariantProps } from '#lib/types/index.js';

	type Props = {
		value: string;
		label: string;
		activityTitle: string;
	} & WidgetVariantProps;

	let { value, label, activityTitle, variant }: Props = $props();

	const STYLES: Record<
		WidgetVariant,
		{ bib: string; label: string; fitMax: string; title: string }
	> = {
		dashboard: {
			bib: 'gap-3 px-5 pt-7 pb-5',
			label: 'stat-label',
			fitMax: '2.5rem',
			title: 'text-sm line-clamp-3'
		},
		export: {
			// Two label lines, so the values of neighbouring bibs line up.
			bib: 'gap-3 px-5 pt-10 pb-5',
			label: 'card-label min-h-[calc(var(--label-size)*2.6)] text-[var(--color-text-muted)]',
			fitMax: 'calc(64px * var(--stat-scale))',
			title: 'card-text-sm line-clamp-2'
		}
	};

	const style = $derived(STYLES[variant]);
</script>

<div class="pr-card bib flex h-full flex-col {style.bib}" data-variant={variant}>
	<span class="min-w-0 text-balance {style.label}">{label}</span>

	<div class="@container">
		<!-- The full-size font sets every bib's line box and baseline, so a shrunk value still lines up. -->
		<div
			data-testid="record-value"
			class="stat-value leading-[1.05] whitespace-nowrap text-[var(--color-text-primary)]"
			style:font-size={style.fitMax}
		>
			<span class="fit-value" style:--fit-chars={value.length} style:--fit-max={style.fitMax}
				>{value}</span
			>
		</div>
	</div>

	{#if activityTitle}
		<div
			data-testid="record-title"
			class="mt-auto min-w-0 border-t border-[var(--color-border)] pt-3 wrap-anywhere text-[var(--color-text-muted)] {style.title}"
			title={activityTitle}
		>
			{activityTitle}
		</div>
	{/if}
</div>

<style>
	/* A race bib: accent band across the top and two safety-pin holes. */
	.bib {
		position: relative;
		background: var(--color-surface-elevated);
		border: var(--panel-border-width, 1px) solid var(--color-border);
		border-top: 4px solid var(--color-accent);
		border-radius: var(--panel-radius, var(--radius-panel));
		box-shadow: var(--panel-shadow, none);
	}

	.bib::before,
	.bib::after {
		content: '';
		position: absolute;
		top: 0.625rem;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background: var(--color-surface);
		box-shadow: inset 0 0 0 1px var(--color-border);
	}

	.bib::before {
		left: 0.625rem;
	}

	.bib::after {
		right: 0.625rem;
	}

	.bib[data-variant='export']::before,
	.bib[data-variant='export']::after {
		top: 14px;
		width: 14px;
		height: 14px;
	}

	.bib[data-variant='export']::before {
		left: 14px;
	}

	.bib[data-variant='export']::after {
		right: 14px;
	}
</style>
