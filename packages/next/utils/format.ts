import { BigNumberish } from "@ethersproject/bignumber";
import { utils } from "ethers";

// // Credits: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
// const numberWithCommas = (x: string): string =>
//   x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const numberWithCommas = (x: string): string => x;

const twoDecimals = (number: number): string => number.toFixed(2);

export const formatPercent = (number: number): string =>
  `${numberWithCommas(twoDecimals(Math.round(number * 10000) / 100))}%`; // 10000 because we go from 0.XX to XX.00

export const formatStringAmount = (string: string): string => {
  if (parseInt(string.substring(0, 1), 10) > 0) {
    return `${numberWithCommas(
      twoDecimals(Math.round(parseFloat(string) * 100) / 100)
    )}`;
  }
  return string;
};

export const formatMatic = (amount: BigNumberish): string =>
  formatStringAmount(utils.formatEther(amount));
