import {
	EVENT_VALUES,
	MAX_EVENT_BODY_LENGTH,
	type EventName,
	type EventValue
} from '#lib/constants/events.js';

type ParsedEvent = { [E in EventName]: { ok: true; event: E; value: EventValue<E> } }[EventName];
type ParseError = {
	ok: false;
	error: {
		type: 'invalid-json' | 'unknown-event' | 'invalid-value' | 'unexpected-fields' | 'too-long';
	};
};

export function parseEvent(body: string): ParsedEvent | ParseError {
	if (body.length > MAX_EVENT_BODY_LENGTH) return { ok: false, error: { type: 'too-long' } };
	let data: unknown;
	try {
		data = JSON.parse(body);
	} catch {
		return { ok: false, error: { type: 'invalid-json' } };
	}
	if (!data || typeof data !== 'object' || Array.isArray(data))
		return { ok: false, error: { type: 'invalid-json' } };
	if (Object.keys(data).some((key) => key !== 'event' && key !== 'value'))
		return { ok: false, error: { type: 'unexpected-fields' } };
	const { event, value: inputValue } = data as Record<string, unknown>;
	if (typeof event !== 'string' || !Object.hasOwn(EVENT_VALUES, event))
		return { ok: false, error: { type: 'unknown-event' } };
	const value = inputValue === undefined && event === 'more_stats_opened' ? '' : inputValue;
	if (
		typeof value !== 'string' ||
		!(EVENT_VALUES[event as EventName] as readonly string[]).includes(value)
	)
		return { ok: false, error: { type: 'invalid-value' } };
	return { ok: true, event, value } as ParsedEvent;
}

export function activityCountBucket(count: number): EventValue<'upload_success'> {
	if (count <= 10) return '1-10';
	if (count <= 50) return '11-50';
	if (count <= 200) return '51-200';
	return '200+';
}

export function sportsCountBucket(count: number): EventValue<'sports_count'> {
	if (count <= 1) return '1';
	if (count === 2) return '2';
	if (count <= 5) return '3-5';
	return '6+';
}
