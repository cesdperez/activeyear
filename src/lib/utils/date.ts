export function daysInYear(year: number): number {
	const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	return isLeapYear ? 366 : 365;
}
