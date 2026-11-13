import type { EventValue } from '#lib/constants/events.js';

export type HighlightPreset =
	'longest' | 'farthest' | 'climbs' | 'per-sport' | 'best-month' | 'favorites';

export type ActivityType =
	| 'running'
	| 'cycling'
	| 'swimming'
	| 'walking'
	| 'hiking'
	| 'strength'
	| 'yoga'
	| 'cardio'
	| 'rowing'
	| 'paddling'
	| 'winter'
	| 'racket'
	| 'climbing'
	| 'other';

export interface Activity {
	date: Date;
	type: ActivityType;
	title: string;
	distance: number; // in km
	duration: number; // in seconds
	calories: number;
	elevation: number; // in meters
	favorite: boolean;
}

export interface YearStats {
	totalDistance: number; // in km
	totalDuration: number; // in seconds
	totalCalories: number;
	totalElevation: number; // in meters
	activeDays: number;
	longestStreak: number;
	activityCount: number;
}

export interface PersonalRecord {
	value: number;
	activity: Activity;
}

export interface PersonalRecords {
	longestDistance: PersonalRecord | null;
	longestDuration: PersonalRecord | null;
	biggestBurn: PersonalRecord | null;
}

export interface SportBreakdown {
	type: ActivityType;
	distance: number; // in km
	duration: number; // in seconds
	count: number;
}

export type BreakdownMetric = 'count' | 'duration';

// Weekly activity pattern - count of activities per day of week
// Index 0 = Monday, 6 = Sunday
export type WeeklyPattern = [number, number, number, number, number, number, number];

export interface GarminRawActivity {
	'Activity Type': string;
	Date: string;
	Title: string;
	Distance: string;
	Calories: string;
	Time: string;
	'Total Ascent': string;
	'Total Descent': string;
	[key: string]: string; // Allow other columns
}

export type Theme = 'neon' | 'minimalist' | 'retro' | 'classic' | 'synthwave' | 'lightmile';

export type AspectRatio = '9:16';

export type CardVariant = 'summary' | 'breakdown' | 'highlights';

/** Where a shared widget renders: the responsive dashboard or a fixed-size export card. */
export type WidgetVariant = 'dashboard' | 'export';
export type WidgetVariantProps =
	{ variant: 'export'; theme: Theme } | { variant: 'dashboard'; theme?: never };

export type SummaryMetric = 'distance' | 'elevation' | 'duration' | 'calories';

export type Unit = 'km' | 'miles';
export type GarminUnits = 'metric' | 'imperial';
export interface ParseOptions {
	garminUnits?: GarminUnits;
}

export type AvatarError = { type: 'invalid' | 'unreadable' };
export type ExportError = { type: 'ready' | 'fontsUnavailable' | 'failed' };
export type ExportStatus = { type: 'generating' | 'done' };

export type SavedYearError =
	| { type: 'invalid-file' }
	| { type: 'unsupported-version'; version: unknown }
	| { type: 'wrong-year'; year: unknown; expected: number }
	| { type: 'invalid-activities' };

export type UploadError =
	| SavedYearError
	| UnusableFileError
	| {
			type:
				'invalid-extension' | 'unrecognised' | 'strava-unsupported-language' | 'unknown-failure';
	  };

export type YearFileResult =
	| {
			type: 'loaded';
			activities: Activity[];
			source: ActivitySource | null;
			cutShort: Date | null;
			parseErrors: ParseError[];
	  }
	| {
			type: 'failed';
			event: EventValue<'upload_error'>;
			error: UploadError;
			parseErrors?: ParseError[];
	  };

export interface LoadedYear {
	activities: Activity[];
	source: ActivitySource | null;
	cutShort: Date | null;
	loadedAt: Date | null;
}

export type ActivitySource = 'garmin' | 'strava';

export interface ParseResult {
	source: ActivitySource | null;
	activities: Activity[];
	errors: ParseError[];
	/** Every year with a readable activity in the file, ascending, whatever the target year. */
	yearsInFile: number[];
	rowCount: number;
}

/** Reads one export format; `detect` decides whether `parse` should handle the file. */
export interface ActivityParser {
	detect(csvContent: string): boolean;
	parse(csvContent: string, year: number, options?: ParseOptions): ParseResult;
}

/** Row errors that keep the row out of the totals. */
export type RowErrorType = 'invalid-date' | 'malformed-quotes' | 'missing-column';

export interface ParseError {
	type: RowErrorType | 'invalid-number' | 'unsupported-format' | 'unknown';
	row: number;
	reason?: 'unrecognised' | 'strava-unsupported-language';
	message: string;
}

export interface SkippedRows {
	count: number;
	reason: RowErrorType;
	exampleRow: number;
}

/** Why a parsed file gave no activities to show. */
export type UnusableFileError =
	| { type: 'rows-rejected'; skipped: SkippedRows }
	| {
			type: 'no-activities-in-year';
			year: number;
			yearsInFile: number[];
			skipped: SkippedRows | null;
	  };

export interface FaqItem {
	question: string;
	answer: string;
	tip?: { text: string; label: string };
}

export type JsonLdObject = Record<string, unknown>;

export interface ExportStep {
	text: string;
	link?: { href: string; label: string };
}

export interface QuarterTotals {
	quarter: 1 | 2 | 3 | 4;
	distance: number; // in km
	duration: number; // in seconds
	count: number;
}

export interface ActivityBreak {
	days: number;
	start: Date; // first inactive day, local midnight
	end: Date; // last inactive day, local midnight
}

export interface WeekdayTotals {
	distance: WeeklyPattern; // in km
	duration: WeeklyPattern; // in seconds
}

export interface SportAverage {
	type: ActivityType;
	count: number;
	averageDistance: number; // in km
	averageDuration: number; // in seconds
}

export type Locale = (typeof import('#lib/constants/locales.js').LOCALES)[number];

export type Messages = typeof import('#lib/i18n/messages/en/index.js').en;

export interface SummaryCardData {
	stats: YearStats | null;
	breakdown: SportBreakdown[];
	records: PersonalRecords | null;
}

export interface SummaryCardSettings {
	theme: Theme;
	unit: Unit;
	summaryMetric: SummaryMetric;
	breakdownMetric: BreakdownMetric;
}

export interface SummaryCardModel {
	centeredAvatar: boolean;
	topSport: SportBreakdown | undefined;
	totals: import('#lib/utils/totals.js').TotalStat[];
	hero: import('#lib/utils/totals.js').TotalStat | undefined;
	supporting: import('#lib/utils/totals.js').TotalStat[];
	fitChars: number;
	records: Activity[];
}

export interface BreakdownCardData {
	stats: YearStats | null;
	breakdown: SportBreakdown[] | null;
}

export interface BreakdownCardSettings {
	theme: Theme;
	breakdownMetric: BreakdownMetric;
}

export interface BreakdownCardModel {
	topSports: SportBreakdown[];
	colors: import('#lib/utils/breakdown.js').SportColors;
	activeDays: number;
	longestStreak: number;
}

export type AppStatus = 'idle' | 'parsing' | 'ready' | 'error';
export interface GarminLocale {
	headers: Record<string, string>;
	types: Record<string, string>;
}

export type StravaLocale = {
	headers: Record<string, string>;
	types: Record<string, string>;
	months: string[];
};
