const twoDecimals = (number: number): string => number.toFixed(2);

export const formatPercent = (number: number): string =>
  `${twoDecimals(Math.round(number * 10000) / 100)}%`;

export const formatStringAmount = (string: string): string =>
  `${twoDecimals(Math.round(parseFloat(string) * 10000) / 100)}`;
