import type { ParseResult } from '#lib/types/index.js';
import { garminParser } from './garmin.js';

export interface ActivityParser {
	detect(csvContent: string): boolean;
	parse(csvContent: string, year: number): ParseResult;
}

const PARSERS: ActivityParser[] = [garminParser];

/** Parses the CSV with the first parser that recognises its format. */
export function parseActivityCsv(csvContent: string, year: number): ParseResult {
	const parser = PARSERS.find((p) => p.detect(csvContent));
	if (parser) return parser.parse(csvContent, year);

	return {
		activities: [],
		errors: [
			{
				type: 'unsupported-format',
				row: 0,
				message:
					"We couldn't recognise this file. Export your activities from Garmin Connect set to English and upload that CSV."
			}
		]
	};
}
