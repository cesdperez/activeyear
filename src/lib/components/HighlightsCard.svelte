<script lang="ts">
	import { appStore } from '#lib/stores/app.svelte.js';
	import { formatDistance, formatDuration } from '#lib/utils/format.js';
	import { Star, Target } from 'phosphor-svelte';
	import { sportNames, sportIcons } from '#lib/constants/sports.js';
	import ExportCardBase from './ExportCardBase.svelte';

	const monthNames = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	];

	let highlights = $derived(
		appStore.highlights
			.slice(0, 10)
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	);
</script>

<ExportCardBase variant="highlights" title="HIGHLIGHTS">
	<div class="-mt-[52px] flex flex-1 flex-col px-6">
		{#if highlights.length === 0}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center text-[28px] text-[var(--color-text-muted)]">
					No highlight activities yet
				</div>
			</div>
		{:else}
			<!-- Timeline Container -->
			<div class="relative flex flex-1 flex-col justify-center">
				<!-- Timeline Items -->
				<div
					class="relative flex w-full flex-col"
					style="gap: {Math.min(
						160,
						Math.max(32, (1250 - highlights.length * 120) / Math.max(highlights.length - 1, 1))
					)}px;"
				>
					<!-- Vertical Timeline Line -->
					<div class="timeline-line absolute top-[45px] bottom-[45px] left-[60px] w-[4px]"></div>
					{#each highlights as fav, i}
						{@const IconComponent = sportIcons[fav.type] ?? Target}
						{@const date = new Date(fav.date)}
						{@const month = monthNames[date.getMonth()]}
						{@const day = date.getDate()}

						<div class="relative flex items-center gap-6">
							<!-- Date Column -->
							<div class="w-[48px] shrink-0 text-center">
								<div class="text-[14px] font-bold tracking-widest text-[var(--color-accent)]">
									{month}
								</div>
								<div class="text-[32px] leading-none font-black text-[var(--color-text-primary)]">
									{day}
								</div>
							</div>

							<!-- Timeline Node -->
							<div
								class="timeline-node relative z-10 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full"
							>
								<div class="h-[14px] w-[14px] rounded-full bg-[var(--color-accent)]"></div>
							</div>

							<!-- Activity Card -->
							<div
								class="flex flex-1 items-center {highlights.length < 7
									? 'gap-8 p-8'
									: 'gap-4 p-4'} timeline-card rounded-2xl"
							>
								<div
									class="{highlights.length < 7
										? 'h-16 w-16 rounded-2xl'
										: 'h-12 w-12 rounded-xl'} flex shrink-0 items-center justify-center bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
								>
									<IconComponent
										class={highlights.length < 7 ? 'h-8 w-8' : 'h-6 w-6'}
										weight="bold"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center gap-2">
										<Star
											class="{highlights.length < 7
												? 'h-6 w-6'
												: 'h-4 w-4'} shrink-0 text-yellow-500"
											weight="fill"
										/>
										<div
											class="{highlights.length < 7
												? 'text-[32px]'
												: 'text-[22px]'} line-clamp-2 min-w-0 flex-1 font-bold text-[var(--color-text-primary)]"
										>
											{fav.title || sportNames[fav.type] || 'Activity'}
										</div>
									</div>
									<div
										class="flex flex-wrap items-center gap-x-3 gap-y-1 {highlights.length < 7
											? 'text-[22px]'
											: 'text-[16px]'} text-[var(--color-text-muted)]"
									>
										{#if fav.distance > 0}
											<span class="font-mono">
												{formatDistance(fav.distance, appStore.unit)}
											</span>
										{/if}
										<span class="font-mono">
											{formatDuration(fav.duration)}
										</span>
										<span
											class="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[12px] tracking-wider text-[var(--color-accent)] uppercase"
										>
											{sportNames[fav.type] ?? fav.type}
										</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if appStore.highlights.length > 10}
				<div class="mt-6 text-center text-[20px] text-[var(--color-text-muted)]">
					+{appStore.highlights.length - 10} more highlights
				</div>
			{/if}
		{/if}
	</div>
</ExportCardBase>
