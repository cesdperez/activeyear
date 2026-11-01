<script lang="ts">
    import { appStore } from "#lib/stores/app.svelte.js";

    let { title }: { title: string } = $props();
</script>

<header class="text-center mb-[130px] relative">
    {#if appStore.userName}
        <p
            class="text-[42px] font-bold text-[var(--color-accent)] mb-2 relative z-10 leading-none uppercase tracking-widest mr-[-0.1em]"
        >
            {appStore.userName}'s
        </p>
    {/if}
    <div class="flex flex-col items-center justify-center">
        <h2
            class="text-[140px] font-black text-[var(--color-text-primary)] leading-[0.8] mb-2 tracking-tighter mr-[0.05em]"
        >
            {appStore.selectedYear}
        </h2>
        <h1
            class="text-[72px] font-bold tracking-[0.15em] export-title leading-none relative z-10 uppercase text-[var(--color-text-dim)] mr-[-0.15em]"
        >
            {title}
        </h1>
    </div>
</header>

<style>
    :global(.theme-neon) .export-title {
        text-shadow: 0 0 40px var(--color-accent-glow);
        color: var(--color-text-primary);
    }

    :global(.theme-minimalist) .export-title {
        color: #000;
        letter-spacing: -0.05em;
    }

    :global(.theme-retro) .export-title {
        text-shadow: 3px 3px 0px var(--color-accent-dim);
        font-style: italic;
    }
</style>
