<script lang="ts">
	import '@fontsource/outfit/400.css';
	import '@fontsource/outfit/500.css';
	import '@fontsource/outfit/600.css';
	import '@fontsource/outfit/700.css';
	import '@fontsource/outfit/800.css';
	import '@fontsource/outfit/900.css';
	import '@fontsource/jetbrains-mono/latin-500.css';
	import '@fontsource/jetbrains-mono/latin-ext-500.css';
	import '@fontsource/jetbrains-mono/latin-700.css';
	import '@fontsource/jetbrains-mono/latin-ext-700.css';
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
