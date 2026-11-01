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

export type Theme = 'neon' | 'minimalist' | 'retro';

export type AspectRatio = '9:16';

export type CardVariant = 'summary' | 'breakdown' | 'highlights';

/** Where a shared widget renders: the responsive dashboard or a fixed-size export card. */
export type WidgetVariant = 'dashboard' | 'export';

export type SummaryMetric = 'distance' | 'elevation' | 'duration' | 'calories';

export type Unit = 'km' | 'miles';

export interface ParseResult {
	activities: Activity[];
	errors: ParseError[];
}

/** Reads one export format; `detect` decides whether `parse` should handle the file. */
export interface ActivityParser {
	detect(csvContent: string): boolean;
	parse(csvContent: string, year: number): ParseResult;
}

export interface ParseError {
	type: 'invalid-date' | 'invalid-number' | 'missing-column' | 'unsupported-format' | 'unknown';
	row: number;
	message: string;
}
