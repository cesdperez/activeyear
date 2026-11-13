<script lang="ts">
	import { faqItems, faqMessages } from '#lib/data/faq.js';
	import { i18n } from '#lib/i18n/i18n.svelte.js';
	import { faqPageSchema } from '#lib/utils/structuredData.js';
	import JsonLd from './JsonLd.svelte';
</script>

<JsonLd data={faqPageSchema(faqItems(i18n.locale))} />

<section aria-labelledby="faq-heading" class="mt-12 w-full max-w-md">
	<h2 id="faq-heading" class="mb-4 text-center text-sm font-medium text-zinc-300">
		{faqMessages[i18n.locale].heading}
	</h2>
	<dl class="space-y-4 text-left text-sm text-pretty">
		{#each faqItems(i18n.locale) as { question, answer } (question)}
			<div>
				<dt class="font-medium text-zinc-300">{question}</dt>
				<dd class="mt-1 text-zinc-400">{answer}</dd>
			</div>
		{/each}
	</dl>
</section>
