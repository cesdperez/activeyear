<script lang="ts">
	import '@fontsource/big-shoulders-display/latin-700';
	import '@fontsource/big-shoulders-display/latin-ext-700';
	import '@fontsource/big-shoulders-display/latin-800';
	import '@fontsource/big-shoulders-display/latin-ext-800';
	import '@fontsource/big-shoulders-display/latin-900';
	import '@fontsource/big-shoulders-display/latin-ext-900';
	import '@fontsource/archivo/latin-400';
	import '@fontsource/archivo/latin-ext-400';
	import '@fontsource/archivo/latin-500';
	import '@fontsource/archivo/latin-ext-500';
	import '@fontsource/archivo/latin-600';
	import '@fontsource/archivo/latin-ext-600';
	import '@fontsource/archivo/latin-800';
	import '@fontsource/archivo/latin-ext-800';
	import '@fontsource/archivo/latin-900';
	import '@fontsource/archivo/latin-ext-900';
	import '@fontsource/geist-mono/latin-400';
	import '@fontsource/geist-mono/latin-ext-400';
	import '@fontsource/geist-mono/latin-700';
	import '@fontsource/geist-mono/latin-ext-700';
	import '@fontsource/archivo/latin-700';
	import '@fontsource/archivo/latin-ext-700';
	import '@fontsource/press-start-2p/latin-400';
	import '@fontsource/press-start-2p/latin-ext-400';
	import '@fontsource/vt323/latin-400';
	import '@fontsource/vt323/latin-ext-400';
	import '@fontsource/outfit/latin-400';
	import '@fontsource/outfit/latin-ext-400';
	import '@fontsource/outfit/latin-500';
	import '@fontsource/outfit/latin-ext-500';
	import '@fontsource/outfit/latin-600';
	import '@fontsource/outfit/latin-ext-600';
	import '@fontsource/outfit/latin-700';
	import '@fontsource/outfit/latin-ext-700';
	import '@fontsource/outfit/latin-800';
	import '@fontsource/outfit/latin-ext-800';
	import '@fontsource/outfit/latin-900';
	import '@fontsource/outfit/latin-ext-900';
	import '../app.css';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import LanguagePicker from '#lib/components/LanguagePicker.svelte';
	import DashboardToolbar from '#lib/components/dashboard/DashboardToolbar.svelte';
	import { appStore } from '#lib/stores/app.svelte.js';
	import { THEME_OPTIONS } from '#lib/constants/export.js';
	import MetaTags from '#lib/components/MetaTags.svelte';
	import { inlinedFontFaceCss, loadAppFonts } from '#lib/utils/fonts.js';

	let { children } = $props();

	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});

	// Inline every theme's fonts up front so exports work offline.
	onMount(() => {
		loadAppFonts()
			.then(() => Promise.all(THEME_OPTIONS.map(({ value }) => inlinedFontFaceCss(value))))
			.catch(() => {});
	});
</script>

{#if page.route.id !== '/404'}
	<MetaTags />
	<div class="absolute top-4 right-4 z-20 flex items-center gap-2 md:right-8">
		{#if appStore.status === 'ready'}<DashboardToolbar />{/if}
		<LanguagePicker />
	</div>
{/if}

{@render children()}
