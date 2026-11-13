export function isFileDrag(event: DragEvent): boolean {
	return event.dataTransfer?.types.includes('Files') ?? false;
}
