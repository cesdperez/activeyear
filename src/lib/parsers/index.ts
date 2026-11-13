import type { ActivityParser, ParseResult, ParseOptions } from '#lib/types/index.js';
import { emptyResult } from './csv.js';
import { garminParser } from './garmin.js';
import { stravaParser } from './strava.js';

const PARSERS: ActivityParser[] = [garminParser, stravaParser];

/** Parses the CSV with the first parser that recognises its format. */
export function parseActivityCsv(
	csvContent: string,
	year: number,
	options?: ParseOptions
): ParseResult {
	const parser = PARSERS.find((p) => p.detect(csvContent));
	if (parser) return parser.parse(csvContent, year, options);

	return emptyResult(null, {
		type: 'unsupported-format',
		reason: 'unrecognised',
		row: 0,
		message:
			"We couldn't recognise this file. Upload the Activities CSV from Garmin Connect or activities.csv from your Strava account export in English, Spanish, German, French, Italian, Dutch or Portuguese."
	});
}
