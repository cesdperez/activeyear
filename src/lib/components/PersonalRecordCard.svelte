<script lang="ts">
    import { onMount } from "svelte";
    import { spring } from "svelte/motion";
    import type { Snippet } from "svelte";

    interface Props {
        value: string;
        label: string;
        detail?: string;
        icon?: Snippet;
        delay?: number;
    }

    let { value, label, detail, icon, delay = 0 }: Props = $props();

    // Animation state
    let opacity = spring(0, { stiffness: 0.1, damping: 0.6 });
    let scale = spring(0.95, { stiffness: 0.15, damping: 0.5 });

    onMount(() => {
        const timer = setTimeout(() => {
            opacity.set(1);
            scale.set(1);
        }, delay);

        return () => clearTimeout(timer);
    });
</script>

<div
    class="pr-card group relative overflow-hidden"
    style="opacity: {$opacity}; transform: scale({$scale});"
>
    <!-- Background Mesh Gradient -->
    <div
        class="absolute inset-0 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)] z-0"
    ></div>

    <!-- Subtle accent spotlight -->
    <div
        class="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-accent)] opacity-[0.05] blur-[60px] rounded-full group-hover:opacity-[0.1] transition-opacity duration-500"
    ></div>

    <!-- Content -->
    <div class="relative z-10 p-6 flex items-start gap-4">
        <!-- Icon Badge -->
        <div
            class="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-surface-hover)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[var(--color-gold)] shadow-sm group-hover:scale-110 group-hover:border-[rgba(250,204,21,0.3)] transition-all duration-300"
        >
            {#if icon}
                <div class="icon-inner">
                    {@render icon()}
                </div>
            {/if}
        </div>

        <div class="flex-1 min-w-0">
            <div class="stat-label mb-1 text-xs tracking-wider opacity-70">
                {label}
            </div>

            <div
                class="stat-value {value.length > 12
                    ? 'text-xl md:text-2xl'
                    : 'text-2xl md:text-3xl'} text-white mb-1 group-hover:glow-text transition-all duration-300"
            >
                {value}
            </div>

            {#if detail}
                <div
                    class="text-xs text-[var(--color-text-muted)] truncate flex items-center gap-1.5 mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)]"
                >
                    <span
                        class="w-1 h-1 rounded-full bg-[var(--color-accent)] opacity-50"
                    ></span>
                    {detail}
                </div>
            {/if}
        </div>
    </div>

    <!-- Interactive Border -->
    <div
        class="absolute inset-0 border border-[rgba(255,255,255,0.05)] rounded-2xl pointer-events-none group-hover:border-[rgba(34,211,238,0.3)] transition-colors duration-300"
    ></div>
</div>

<style>
    .pr-card {
        border-radius: 1rem;
        /* background: var(--color-surface-elevated); */
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.2);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .pr-card:hover {
        transform: translateY(-4px) scale(1.01) !important; /* Override spring for hover */
        box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.3);
    }

    .icon-inner :global(svg) {
        width: 1.5rem;
        height: 1.5rem;
        stroke-width: 1.75;
    }
</style>
