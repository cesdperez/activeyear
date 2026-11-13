<script lang="ts">
	/** The ActiveYear wordmark. Size it with `font-size` through `class`. */
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class="logotype {className}" role="img" aria-label="ActiveYear">
	<!-- A dotless i whose dot is a day tick from the year lane. -->
	<span aria-hidden="true">Act<span class="i">ı<span class="tick"></span></span>veYear</span>
</span>

<style>
	.logotype {
		display: inline-block;
		font-family: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
		font-weight: 900;
		line-height: 1;
		letter-spacing: 0.01em;
		color: var(--color-text-primary);
		white-space: nowrap;
	}

	.i {
		position: relative;
	}

	.tick {
		position: absolute;
		left: 50%;
		bottom: 0.71em;
		width: 0.105em;
		height: 0.21em;
		transform: translateX(-50%);
		background: var(--color-accent);
	}
</style>
