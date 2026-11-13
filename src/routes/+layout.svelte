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
	import '@fontsource/archivo/latin-700';
	import '@fontsource/archivo/latin-ext-700';
	import '@fontsource/press-start-2p/latin-400';
	import '@fontsource/press-start-2p/latin-ext-400';
	import '@fontsource/vt323/latin-400';
	import '@fontsource/vt323/latin-ext-400';
	import '../app.css';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import LanguagePicker from '#lib/components/LanguagePicker.svelte';
	import MetaTags from '#lib/components/MetaTags.svelte';
	import { inlinedFontFaceCss, loadAppFonts } from '#lib/utils/fonts.js';

	let { children } = $props();

	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});

	// Fetch every face up front, so a later offline export still has them; export reports failures.
	onMount(() => {
		loadAppFonts()
			.then(inlinedFontFaceCss)
			.catch(() => {});
	});
</script>

{#if page.route.id !== '/404'}
	<MetaTags />
	<LanguagePicker />
{/if}

{@render children()}
