<script lang="ts">
	import { SITE_NAME } from '#lib/constants/site.js';
	import Logotype from '#lib/components/Logotype.svelte';
</script>

<svelte:head>
	<title>Page not found · {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=4" />
</svelte:head>

<main class="min-h-screen">
	<div class="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
		<Logotype class="mb-12 text-4xl" />
		<h1 class="display-heading mb-3 text-[clamp(3rem,10vw,6rem)]">Page not found</h1>
		<p class="mb-8 text-lg text-[var(--color-text-muted)]">This page took a rest day.</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- served at any unknown path, so a relative href would break -->
		<a href="/" class="btn-secondary">Back to {SITE_NAME}</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
</main>
