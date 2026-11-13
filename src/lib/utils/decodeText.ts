/** Decodes UTF-8, or Windows-1252 when the bytes are not valid UTF-8, as older spreadsheet exports are. */
export function decodeText(bytes: ArrayBuffer | Uint8Array): string {
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
	} catch {
		return new TextDecoder('windows-1252').decode(bytes);
	}
}
