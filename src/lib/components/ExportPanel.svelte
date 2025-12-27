<script lang="ts">
    import { appStore } from "$lib/stores/app.svelte.js";
    import ExportCard, { getExportElement } from "./ExportCard.svelte";
    import { exportToPng } from "$lib/utils/export.js";
    import { Download } from "@lucide/svelte";
    import type { AspectRatio, Theme } from "$lib/types/index.js";

    let isExporting = $state(false);
    let exportError = $state<string | null>(null);

    const aspectRatios: {
        value: AspectRatio;
        label: string;
        description: string;
    }[] = [
        { value: "9:16", label: "9:16", description: "Stories" },
        { value: "1:1", label: "1:1", description: "Feed" },
        { value: "4:5", label: "4:5", description: "Portrait" },
    ];

    const themes: {
        value: Theme;
        label: string;
        description: string;
    }[] = [
        { value: "neon", label: "Neon", description: "Cyberpunk" },
        { value: "minimalist", label: "Minimal", description: "Swiss" },
        { value: "retro", label: "Retro", description: "8-bit" },
    ];

    async function handleExport() {
        const element = getExportElement();
        if (!element) {
            exportError = "Export element not found";
            return;
        }

        isExporting = true;
        exportError = null;

        try {
            const filename = appStore.userName
                ? `${appStore.userName.toLowerCase().replace(/\s+/g, "-")}-2025`
                : "activeyear-2025";
            await exportToPng(element, { filename });
        } catch (error) {
            exportError =
                error instanceof Error ? error.message : "Failed to export";
        } finally {
            isExporting = false;
        }
    }

    function setAspectRatio(ratio: AspectRatio) {
        appStore.aspectRatio = ratio;
    }

    function setTheme(theme: Theme) {
        appStore.theme = theme;
    }
</script>

<section class="export-panel">
    <div class="flex items-end gap-4 mb-8">
        <h2 class="text-3xl font-bold tracking-tight">Export</h2>
        <div
            class="h-px flex-1 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-20 mb-2"
        ></div>
    </div>

    <!-- Controls Row -->
    <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- Left: Controls -->
        <div class="w-full lg:w-80 space-y-6 shrink-0">
            <!-- Name Input -->
            <div>
                <label
                    for="userName"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                >
                    Your Name (optional)
                </label>
                <input
                    type="text"
                    id="userName"
                    bind:value={appStore.userName}
                    placeholder="César"
                    class="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-zinc-500 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />
            </div>

            <!-- Aspect Ratio Selector -->
            <div>
                <label class="block text-sm font-medium text-zinc-400 mb-2">
                    Aspect Ratio
                </label>
                <div class="flex gap-2">
                    {#each aspectRatios as ratio}
                        <button
                            onclick={() => setAspectRatio(ratio.value)}
                            class="flex-1 px-4 py-3 rounded-lg text-center transition-all duration-200 {appStore.aspectRatio ===
                            ratio.value
                                ? 'bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold'
                                : 'bg-[var(--color-surface-elevated)] text-zinc-400 hover:text-white hover:bg-[var(--color-surface-hover)]'}"
                        >
                            <div class="text-sm font-bold">{ratio.label}</div>
                            <div class="text-xs opacity-70">
                                {ratio.description}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Theme Selector -->
            <div>
                <label class="block text-sm font-medium text-zinc-400 mb-2">
                    Theme
                </label>
                <div class="flex gap-2">
                    {#each themes as theme}
                        <button
                            onclick={() => setTheme(theme.value)}
                            class="flex-1 px-4 py-3 rounded-lg text-center transition-all duration-200 {appStore.theme ===
                            theme.value
                                ? 'bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold'
                                : 'bg-[var(--color-surface-elevated)] text-zinc-400 hover:text-white hover:bg-[var(--color-surface-hover)]'}"
                        >
                            <div class="text-sm font-bold">{theme.label}</div>
                            <div class="text-xs opacity-70">
                                {theme.description}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Download Button -->
            <button
                onclick={handleExport}
                disabled={isExporting}
                class="w-full btn-primary flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {#if isExporting}
                    <span class="animate-spin">⏳</span>
                    Generating...
                {:else}
                    <Download class="w-5 h-5" strokeWidth={2} />
                    Download PNG
                {/if}
            </button>

            {#if exportError}
                <p class="text-red-400 text-sm">{exportError}</p>
            {/if}

            <!-- Tips -->
            <div class="text-xs text-zinc-500 space-y-1">
                <p>💡 9:16 is perfect for Instagram/TikTok Stories</p>
                <p>💡 1:1 works great for Twitter and LinkedIn</p>
            </div>
        </div>

        <!-- Right: Preview -->
        <div class="flex-1 flex flex-col items-center">
            <div class="text-sm text-zinc-500 mb-4">Preview</div>
            <div
                class="overflow-hidden rounded-lg border border-[rgba(255,255,255,0.1)] shadow-2xl"
            >
                <ExportCard />
            </div>
        </div>
    </div>
</section>

<style>
    .export-panel {
        padding-top: 2rem;
        margin-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
</style>
