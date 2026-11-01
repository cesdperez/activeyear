import { appStore } from '#lib/stores/app.svelte.js';
import confetti from 'canvas-confetti';

/**
 * Rains confetti while celebration mode is on. Call during component initialisation.
 */
export function useConfettiRain() {
	$effect(() => {
		if (appStore.confettiEnabled) {
			const cleanup = startConfetti();
			return cleanup;
		}
	});
}

function startConfetti() {
	let timeoutId: ReturnType<typeof setTimeout>;
	let active = true;

	(function frame() {
		if (!appStore.confettiEnabled || !active) return;

		confetti({
			particleCount: 1,
			startVelocity: 0,
			ticks: 800,
			gravity: 0.3,
			scalar: 0.7,
			origin: {
				x: Math.random(),
				// since they fall down, start a bit above the screen
				y: -0.1
			},
			colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
			shapes: ['circle', 'square'],
			disableForReducedMotion: true
		});

		timeoutId = setTimeout(frame, 140);
	})();

	return () => {
		active = false;
		clearTimeout(timeoutId);
	};
}
