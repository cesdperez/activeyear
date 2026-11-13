import type {
	BreakdownCardData,
	BreakdownCardSettings,
	Locale,
	BreakdownCardModel,
	SummaryCardData,
	SummaryCardSettings,
	SummaryCardModel
} from '#lib/types/index.js';
import { CENTERED_AVATAR_THEMES } from '#lib/constants/themes.js';
import { rankSports, selectTopSports, sportColorsFor } from '#lib/utils/breakdown.js';
import { showsValue } from '#lib/utils/format.js';
import { summaryMetricWithValue } from '#lib/utils/stats.js';
import { scaledLength, totalStats, UNIT_SCALE } from '#lib/utils/totals.js';
import { recordActivities } from '#lib/utils/yearLane.js';

export function summaryCardModel(
	data: SummaryCardData,
	settings: SummaryCardSettings,
	locale: Locale
): SummaryCardModel {
	const centeredAvatar = CENTERED_AVATAR_THEMES.includes(settings.theme);
	const topSport = rankSports(data.breakdown, settings.breakdownMetric)[0];
	const totals = data.stats ? totalStats(locale, data.stats, settings.unit) : [];
	const heroMetric = data.stats
		? summaryMetricWithValue(data.stats, settings.summaryMetric, settings.unit)
		: settings.summaryMetric;
	const hero = totals.find((stat) => stat.id === heroMetric) ?? totals[0];
	const supporting = totals.filter((stat) => stat !== hero && showsValue(stat.value));
	const fitChars = Math.max(
		...supporting.map((stat) => scaledLength(stat.value, UNIT_SCALE.board))
	);
	return {
		centeredAvatar,
		topSport,
		totals,
		hero,
		supporting,
		fitChars,
		records: recordActivities(data.records)
	};
}

export function breakdownCardModel(
	data: BreakdownCardData,
	settings: BreakdownCardSettings
): BreakdownCardModel {
	const topSports = selectTopSports(data.breakdown ?? [], settings.breakdownMetric);
	return {
		topSports,
		colors: sportColorsFor(topSports, settings.theme),
		activeDays: data.stats?.activeDays ?? 0,
		longestStreak: data.stats?.longestStreak ?? 0
	};
}
