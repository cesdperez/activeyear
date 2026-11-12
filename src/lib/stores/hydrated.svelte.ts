import { onMount } from 'svelte';

/**
 * Turns true once the calling component mounts. Server-rendered controls cannot respond before
 * then, so show them as disabled. Call it while the component initialises.
 */
export function createHydrated(): { readonly current: boolean } {
	let current = $state(false);
	onMount(() => {
		current = true;
	});
	return {
		get current() {
			return current;
		}
	};
}
