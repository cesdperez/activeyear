declare module 'cloudflare:workers' {
	export const env: {
		EVENTS?: {
			writeDataPoint(data: { blobs: string[]; doubles: number[]; indexes: string[] }): void;
		};
	};
}

declare namespace App {
	interface PageState {
		dashboard?: boolean;
	}
}
