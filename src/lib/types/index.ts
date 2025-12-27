export type ActivityType = 'running' | 'cycling' | 'swimming' | 'walking' | 'hiking' | 'other';

export interface Activity {
	date: Date;
	type: ActivityType;
	distance: number;
	duration: number;
	calories: number;
	elevation: number;
}

export interface YearStats {
	totalDistance: number;
	totalDuration: number;
	totalCalories: number;
	totalElevation: number;
	activeDays: number;
	longestStreak: number;
	activityCount: number;
}

export type Theme = 'neon' | 'minimalist' | 'retro';

export type AspectRatio = '9:16' | '1:1' | '4:5';
