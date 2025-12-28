<script lang="ts">
	import "../app.css";

	import MetaTags from "$lib/components/MetaTags.svelte";

	let { children } = $props();
</script>

<MetaTags />

{@render children()}
