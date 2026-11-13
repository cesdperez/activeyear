export const supportVisibility = $state({ count: 0, exportActionsVisible: false });

export function observeExportActions(element: Element) {
	const observer = new IntersectionObserver(([entry]) => {
		supportVisibility.exportActionsVisible = entry.isIntersecting;
	});
	observer.observe(element);
	return () => {
		observer.disconnect();
		supportVisibility.exportActionsVisible = false;
	};
}

export function observeSupport(element: Element) {
	let visible = false;
	const observer = new IntersectionObserver(([entry]) => {
		const next = entry.isIntersecting;
		if (next !== visible) {
			supportVisibility.count += next ? 1 : -1;
			visible = next;
		}
	});
	observer.observe(element);
	return () => {
		observer.disconnect();
		if (visible) supportVisibility.count--;
	};
}
