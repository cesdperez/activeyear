import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
import { HIGHLIGHT_PRESETS } from '#lib/constants/highlights.js';
import { sportNames } from '#lib/constants/sports.js';
import type { Activity, ActivityType, HighlightPreset } from '#lib/types/index.js';

const byDate = (a: Activity, b: Activity) => a.date.getTime() - b.date.getTime();
const byDuration = (a: Activity, b: Activity) => b.duration - a.duration || byDate(a, b);

export function presetHighlights(activities: Activity[], preset: HighlightPreset): Activity[] {
	let selected = [...activities];
	let rank = byDuration;
	switch (preset) {
		case 'farthest':
			selected = selected.filter((a) => a.distance > 0);
			rank = (a, b) => b.distance - a.distance || byDate(a, b);
			break;
		case 'climbs':
			selected = selected.filter((a) => a.elevation > 0);
			rank = (a, b) => b.elevation - a.elevation || byDate(a, b);
			break;
		case 'favorites':
			selected = selected.filter((a) => a.favorite === true);
			break;
		case 'per-sport': {
			const best = new Map<ActivityType, Activity>();
			for (const activity of selected) {
				const previous = best.get(activity.type);
				if (!previous || byDuration(activity, previous) < 0) best.set(activity.type, activity);
			}
			selected = [...best.values()];
			break;
		}
		case 'best-month': {
			const totals = new Map<number, number>();
			for (const activity of selected) {
				const month = activity.date.getFullYear() * 12 + activity.date.getMonth();
				totals.set(month, (totals.get(month) ?? 0) + activity.duration);
			}
			const month = [...totals].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
			selected = selected.filter((a) => a.date.getFullYear() * 12 + a.date.getMonth() === month);
			break;
		}
	}
	return selected.sort(rank).slice(0, HIGHLIGHTS_LIMIT).sort(byDate);
}

export function availablePresets(activities: Activity[]): HighlightPreset[] {
	return (Object.keys(HIGHLIGHT_PRESETS) as HighlightPreset[]).filter(
		(preset) => presetHighlights(activities, preset).length > 0
	);
}

export function activitySearchText(activity: Activity): string {
	const date = activity.date;
	const month = date.toLocaleString('en-US', { month: 'long' });
	const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	const distance =
		activity.distance > 0
			? `${Math.round(activity.distance)} km ${Math.round(activity.distance / 1.609344)} mi ${activity.distance.toFixed(1)} km ${activity.distance.toFixed(1)}km ${(activity.distance / 1.609344).toFixed(1)} mi ${(activity.distance / 1.609344).toFixed(1)}mi`
			: '';
	return `${activity.title} ${sportNames[activity.type]} ${month} ${month.slice(0, 3)} ${date.getDate()} ${isoDate} ${distance}`.toLowerCase();
}

export function searchActivities(
	activities: Activity[],
	searchTexts: string[],
	query: string,
	limit: number
): Activity[] {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed || limit <= 0) return [];
	const tokens = trimmed.split(/\s+/);
	const matches: Activity[] = [];
	for (let i = 0; i < activities.length; i++) {
		if (!tokens.every((token) => searchTexts[i].includes(token))) continue;
		const activity = activities[i];
		let position = 0;
		while (position < matches.length && byDate(matches[position], activity) >= 0) position++;
		if (position < limit) {
			matches.splice(position, 0, activity);
			if (matches.length > limit) matches.pop();
		}
	}
	return matches;
}
