<script lang="ts">
    let title = "ActiveYear - Your 2025 in Sport";
    let description =
        "Generate beautiful shareable infographics from your Garmin activity data. All processing happens in your browser, your data never leaves.";
    let url = "https://activeyear.app";
    let image = "https://activeyear.app/og-image.png";
</script>

<svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content="#0a0a0b" />

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
