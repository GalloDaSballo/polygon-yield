// Credits: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const numberWithCommas = (x: string): string =>
  x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const twoDecimals = (number: number): string => number.toFixed(2);

export const formatPercent = (number: number): string =>
  `${numberWithCommas(twoDecimals(Math.round(number * 10000) / 100))}%`;

export const formatStringAmount = (string: string): string =>
  `${numberWithCommas(
    twoDecimals(Math.round(parseFloat(string) * 10000) / 100)
  )}`;
