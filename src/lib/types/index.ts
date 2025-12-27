export type ActivityType =
	| 'running'
	| 'cycling'
	| 'swimming'
	| 'walking'
	| 'hiking'
	| 'strength'
	| 'yoga'
	| 'other';

export interface Activity {
	date: Date;
	type: ActivityType;
	title: string;
	distance: number; // in km
	duration: number; // in seconds
	calories: number;
	elevation: number; // in meters
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

export type AspectRatio = '9:16' | '1:1' | '4:5';

export type Unit = 'km' | 'miles';

export interface ParseResult {
	activities: Activity[];
	errors: ParseError[];
}

export interface ParseError {
	type: 'invalid-date' | 'invalid-number' | 'missing-column' | 'unknown';
	row: number;
	message: string;
}

