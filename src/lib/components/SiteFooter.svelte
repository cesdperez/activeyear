<script lang="ts">
	import { AUTHOR_URL, ISSUES_URL } from '#lib/constants/site.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { uploadStore } from '#lib/stores/upload.svelte.js';
	import SupportLink from './dashboard/SupportLink.svelte';

	const links = $derived([
		{ href: ISSUES_URL, label: i18n.m.common.footer.reportIssue },
		{ href: AUTHOR_URL, label: i18n.m.common.footer.otherProjects }
	]);
</script>

<footer class="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
	<div
		class="flex flex-col items-center gap-4 border-t border-[var(--color-border)] pt-8 text-center"
	>
		{#if uploadStore.status === 'ready'}
			<SupportLink placement="footer" />
		{/if}
		<ul class="flex flex-wrap justify-center gap-x-6 text-sm">
			{#each links as { href, label } (href)}
				<li>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external site, not an app route -->
					<a
						{href}
						target="_blank"
						rel="noopener"
						class="inline-flex items-center text-[var(--color-text-muted)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors duration-200 hover:text-[var(--color-text-primary)] hover:decoration-[var(--color-accent)] pointer-coarse:min-h-11"
						>{label}<span class="sr-only"> {i18n.m.common.footer.opensInNewTab}</span></a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>
	</div>
</footer>
