<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";

    let title = $derived(`ActiveYear - Your ${appStore.selectedYear} in Sport`);
    let description =
        "Transform your Garmin activity data into beautiful, shareable infographics. Private and secure: all processing happens in your browser, so your data never leaves your device.";
    let url = "https://activeyear.app";
    let image = "https://activeyear.app/og-image.png";
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content="#0a0a0b" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
    <link rel="apple-touch-icon" href="/favicon.svg?v=3" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={image} />
</svelte:head>
