<script lang="ts">
	import GelLink from './GelLink.svelte';
	import { faqItems } from '#lib/data/faq.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { faqPageSchema } from '#lib/utils/structuredData.js';
	import JsonLd from './JsonLd.svelte';
</script>

<JsonLd data={faqPageSchema(faqItems(i18n.locale))} />

<section aria-labelledby="faq-heading" class="mt-16 w-full">
	<h2 id="faq-heading" class="display-heading mb-6 text-center text-3xl">
		{i18n.m.faq.heading}
	</h2>
	<dl
		class="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] text-sm text-pretty"
	>
		{#each faqItems(i18n.locale) as { question, answer, tip } (question)}
			<div class="py-4">
				<dt class="font-semibold text-[var(--color-text-primary)]">{question}</dt>
				<dd class="mt-1 leading-relaxed text-[var(--color-text-muted)]">
					{answer}
					{#if tip}
						{tip.text}
						<GelLink placement="faq">{tip.label}</GelLink>.
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
</section>
