import { plural } from '#lib/i18n/plural.js';
export const upload = {
	garminUnits: 'Units in your Garmin account',
	metric: 'Metric',
	imperial: 'Imperial',
	drop: 'Drop your Garmin or Strava CSV here',
	browse: 'or click to browse',
	saved: 'Saved your year before? Drop the .json file',
	privacy: 'Your data never leaves this browser',
	retry: 'Click to try again',
	analyzing: 'Analyzing activities...',
	invalidExtension: 'Please upload a CSV or saved .json file.',
	zipArchive:
		'This is a .zip file. Unzip your Strava export and upload its activities.csv, or upload the Activities CSV from Garmin Connect.',
	unrecognised:
		"We couldn't recognise this file. Upload the Activities CSV from Garmin Connect or activities.csv from your Strava account export in English, Spanish, German, French, Italian, Dutch or Portuguese.",
	stravaUnsupportedLanguage:
		"This Strava export is in a language we can't read yet. Set Strava to English, Spanish, German, French, Italian, Dutch or Portuguese, request a new archive, and upload its activities.csv.",
	unknown: 'Failed to parse file.',
	'invalid-date': 'the date is not valid',
	'malformed-quotes': 'the quote marks do not match',
	'missing-column': 'the activity type or date is missing',
	singleRow: (row: number, reason: string) => `Row ${row} could not be read: ${reason}.`,
	multipleRows: (count: string, row: number, reason: string) =>
		`${count} rows could not be read, e.g. row ${row}: ${reason}.`,
	noActivities: (year: number) => `No ${year} activities found in the file.`,
	years: (range: string, year: number) =>
		`This file has activities from ${range}, none from ${year}.`,
	exportAgain: (year: number) => `Export your activities again to include ${year}.`,
	range: (first: number, last: number) => `${first} to ${last}`,
	skipped: (count: number, formatted: string) =>
		plural('en', count, {
			one: `Skipped ${formatted} row that could not be read`,
			other: `Skipped ${formatted} rows that could not be read`
		}),
	unsupportedVersion: 'This saved year is from an older or newer version of ActiveYear.',
	wrongYear: (year: number, expected: number) =>
		`This file holds your ${year} year, not ${expected}. Upload your ${expected} export instead.`,
	invalidSaved: 'This file is not a saved ActiveYear year.',
	garminDataExport:
		'This file is from a Garmin data export. Upload the Activities CSV from Garmin Connect instead.',
	loading: [
		'Warming up the calves...',
		'Inflating the tires...',
		'Finding the GPS signal...',
		'Chasing down segments...',
		'Hydrating the data...',
		'Lacing up the shoes...',
		'Greasing the chain...',
		'Stretching the glutes...',
		'Calculating VO2 max...',
		'Eating a pre-run banana...',
		'Tightening the cleats...',
		'Checking the wind direction...',
		'Refilling the water bottles...',
		'Syncing with the satellites...',
		'Polishing the frame...',
		'Adjusting the saddle height...',
		'Loading the power meter...',
		'Applying anti-chafe cream...',
		'Checking the weather forecast...',
		'Calibrating the heart rate monitor...'
	]
};
