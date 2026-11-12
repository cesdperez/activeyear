<script lang="ts">
	import { SITE_NAME } from '#lib/constants/site.js';
</script>

<svelte:head>
	<title>Page not found · {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
</svelte:head>

<main class="min-h-screen bg-[var(--color-surface)]">
	<div class="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
		<h1 class="glow-text mb-3 text-4xl font-bold md:text-5xl">Page not found</h1>
		<p class="mb-6 text-lg text-zinc-400">This page took a rest day.</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- served at any unknown path, so a relative href would break -->
		<a href="/" class="text-cyan-400 hover:underline">Back to {SITE_NAME}</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
</main>

<div class="noise-overlay"></div>
