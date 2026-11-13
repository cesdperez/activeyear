const TOP_LEVEL_COMMA = /,(?![^(]*\))/;
const OFFSETS = /(?<![\w.(-])(-?[\d.]+px) (-?)([\d.]+)px/;

/** Negates the vertical offset of every shadow in a computed `box-shadow` or `text-shadow`. */
export function flipShadowY(value: string): string {
	return value
		.split(TOP_LEVEL_COMMA)
		.map((shadow) =>
			shadow.replace(OFFSETS, (match, x: string, sign: string, y: string) =>
				Number(y) === 0 ? match : `${x} ${sign ? '' : '-'}${y}px`
			)
		)
		.join(',');
}
