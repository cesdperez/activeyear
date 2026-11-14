import { HIGHLIGHTS_LIMIT } from '#lib/constants/export.js';
import { HIGHLIGHT_PRESETS } from '#lib/constants/highlights.js';
import { INTL_LOCALES, LOCALES } from '#lib/constants/locales.js';
import { SPORT_NAMES } from '#lib/i18n/messages/sports.js';
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
	return HIGHLIGHT_PRESETS.filter((preset) => presetHighlights(activities, preset).length > 0);
}

const normalizeSearch = (text: string) => text.toLowerCase().replace(/(?<=\d),(?=\d)/g, '.');

const MONTH_FORMATTERS = LOCALES.flatMap((locale) =>
	(['long', 'short'] as const).map(
		(month) => new Intl.DateTimeFormat(INTL_LOCALES[locale], { month })
	)
);

export function activitySearchText(activity: Activity): string {
	const date = activity.date;
	const months = MONTH_FORMATTERS.map((formatter) => formatter.format(date));
	const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	const distance =
		activity.distance > 0
			? `${Math.round(activity.distance)} km ${Math.round(activity.distance / 1.609344)} mi ${activity.distance.toFixed(1)} km ${activity.distance.toFixed(1)}km ${(activity.distance / 1.609344).toFixed(1)} mi ${(activity.distance / 1.609344).toFixed(1)}mi`
			: '';
	return normalizeSearch(
		`${activity.title} ${Object.values(SPORT_NAMES)
			.map((sports) => sports[activity.type])
			.join(' ')} ${months.join(' ')} ${date.getDate()} ${isoDate} ${distance}`
	);
}

export interface SearchResults {
	matches: Activity[];
	total: number;
}

export function searchActivities(
	activities: Activity[],
	searchTexts: string[],
	query: string,
	limit: number
): SearchResults {
	const trimmed = normalizeSearch(query.trim());
	if (!trimmed || limit <= 0) return { matches: [], total: 0 };
	const tokens = trimmed.split(/\s+/);
	const matches: Activity[] = [];
	let total = 0;
	for (let i = 0; i < activities.length; i++) {
		if (!tokens.every((token) => searchTexts[i].includes(token))) continue;
		total++;
		const activity = activities[i];
		let position = 0;
		while (position < matches.length && byDate(matches[position], activity) >= 0) position++;
		if (position < limit) {
			matches.splice(position, 0, activity);
			if (matches.length > limit) matches.pop();
		}
	}
	return { matches, total };
}
