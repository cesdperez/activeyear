export const supportVisibility = $state({ count: 0, busyAreas: 0 });

function countWhileVisible(key: keyof typeof supportVisibility) {
	return (element: Element) => {
		let visible = false;
		const observer = new IntersectionObserver(([entry]) => {
			const next = entry.isIntersecting;
			if (next !== visible) {
				supportVisibility[key] += next ? 1 : -1;
				visible = next;
			}
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
			if (visible) supportVisibility[key]--;
		};
	};
}

export const observeSupport = countWhileVisible('count');

/** Hides the floating support link while the element is on screen, so it never covers its controls. */
export const observeBusyArea = countWhileVisible('busyAreas');

export const observeExportActions = countWhileVisible('busyAreas');
