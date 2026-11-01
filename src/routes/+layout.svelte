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

	import MetaTags from '#lib/components/MetaTags.svelte';

	let { children } = $props();
</script>

<MetaTags />

{@render children()}
