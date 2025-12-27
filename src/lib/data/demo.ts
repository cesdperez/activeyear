import type { YearStats, PersonalRecords, SportBreakdown, Activity } from '../types/index.js';

// Helper to create a dummy activity
const createActivity = (type: string, title: string, dateStr: string): Activity => ({
    type: type as any,
    title,
    date: new Date(dateStr),
    distance: 0,
    duration: 0,
    calories: 0,
    elevation: 0
});

export const demoStats: YearStats = {
    totalDistance: 2025,
    totalDuration: 540000, // 150 hours
    totalCalories: 125000,
    totalElevation: 15400,
    activeDays: 180,
    longestStreak: 12,
    activityCount: 245
};

export const demoRecords: PersonalRecords = {
    longestDistance: {
        value: 42.2,
        activity: {
            ...createActivity('running', 'Marathon Finisher', '2025-10-12'),
            distance: 42.2,
            duration: 12600, // 3.5 hours
            calories: 2800,
            elevation: 150
        }
    },
    longestDuration: {
        value: 14400, // 4 hours
        activity: {
            ...createActivity('cycling', 'Sunday Long Ride', '2025-06-15'),
            distance: 85.0,
            duration: 14400,
            calories: 1500,
            elevation: 800
        }
    },
    biggestBurn: {
        value: 3200,
        activity: {
            ...createActivity('hiking', 'Mountain Summit', '2025-08-01'),
            distance: 15.0,
            duration: 21600, // 6 hours
            calories: 3200,
            elevation: 1200
        }
    }
};

export const demoBreakdown: SportBreakdown[] = [
    {
        type: 'running',
        distance: 1200,
        duration: 216000, // 60 hours
        count: 120
    },
    {
        type: 'cycling',
        distance: 800,
        duration: 144000, // 40 hours
        count: 45
    },
    {
        type: 'strength',
        distance: 0,
        duration: 108000, // 30 hours
        count: 60
    },
    {
        type: 'swimming',
        distance: 25.5,
        duration: 36000, // 10 hours
        count: 15
    },
    {
        type: 'yoga',
        distance: 0,
        duration: 36000, // 10 hours
        count: 5
    }
];
