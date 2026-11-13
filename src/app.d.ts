// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				EVENTS?: {
					writeDataPoint(data: { blobs: string[]; doubles: number[]; indexes: string[] }): void;
				};
			};
			cf?: { country?: string };
		}
	}
}

export {};
