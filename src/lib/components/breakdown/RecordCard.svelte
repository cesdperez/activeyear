<script lang="ts">
    import type { Component } from "svelte";
    import type { IconComponentProps } from "phosphor-svelte";

    let {
        icon: Icon,
        value,
        label,
        activityTitle,
    }: {
        icon: Component<IconComponentProps>;
        value: string;
        label: string;
        activityTitle: string;
    } = $props();
</script>

<div class="record-card-compact">
    <div class="record-icon-compact">
        <Icon class="w-14 h-14" weight="fill" />
    </div>
    <div
        class="text-[42px] font-black text-[var(--color-text-primary)] leading-tight whitespace-nowrap"
    >
        {value}
    </div>
    <div
        class="text-[18px] text-[var(--color-text-muted)] uppercase tracking-widest whitespace-nowrap"
    >
        {label}
    </div>
    <div
        class="text-[16px] text-[var(--color-accent)] mt-2 font-medium line-clamp-2 w-full"
    >
        {activityTitle}
    </div>
</div>
