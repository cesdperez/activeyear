function utf16Encoding(bytes: Uint8Array): 'utf-16le' | 'utf-16be' | null {
	if (bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
	if (bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';
	return null;
}

/** Decodes UTF-16 with a byte order mark, UTF-8, or Windows-1252 when the bytes are not valid UTF-8, as older spreadsheet exports are. */
export function decodeText(bytes: ArrayBuffer | Uint8Array): string {
	const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	const utf16 = utf16Encoding(view);
	if (utf16) return new TextDecoder(utf16).decode(view);
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(view);
	} catch {
		return new TextDecoder('windows-1252').decode(view);
	}
}
