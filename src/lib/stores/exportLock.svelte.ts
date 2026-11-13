class ExportLock {
	#isExporting = $state(false);

	/** Freezes every control that changes the cards, so one export cannot mix settings. */
	get isExporting() {
		return this.#isExporting;
	}

	async hold<T>(run: () => Promise<T>): Promise<T> {
		this.#isExporting = true;
		try {
			return await run();
		} finally {
			this.#isExporting = false;
		}
	}
}

export const exportLock = new ExportLock();
