/* eslint-disable func-names */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ERC20, Myield } from "../typechain";
import { deploy } from "./helpers";

// Testing on matic sees to have issues, we can deploy here and then run the tests


// A better way would be to convert the math functions to pure functions so we can test them here
// For now we'll just copy paste the math code, make sure the code corresponds

const PRECISION = BigNumber.from("1000000000000000000")

const ONE = BigNumber.from("1000000000000000000")
const ZERO_99 = BigNumber.from("990000000000000000")

const TOTAL_SUPPLY_99 = BigNumber.from("99000000000000000000")
const TOTAL_SUPPLY_100 = BigNumber.from("100000000000000000000")

const TOTAL_VALUE_99 = BigNumber.from("99000000000000000000")
const TOTAL_VALUE_100 = BigNumber.from("100000000000000000000")


describe("Math tests", function () {
    describe("fromDepositToShares", () => {
        /**
         *  function fromDepositToShares(uint256 amount) public view returns (uint256){
                return PRECISION.mul(amount).mul(totalSupply()).div(getTotalValue()).div(PRECISION);
            }
         */
        it("99 shares with 99 value, adding 1 means I get 1 share", () => {
            const total = PRECISION.mul(ONE).mul(TOTAL_SUPPLY_99).div(TOTAL_VALUE_99).div(PRECISION)
            expect(total).to.equal(ONE)
        })

        it("99 shares with 100 value, adding 1 means my shares are 0.99 shares", () => {
            const total = PRECISION.mul(ONE).mul(TOTAL_SUPPLY_99).div(TOTAL_VALUE_100).div(PRECISION)
            expect(total).to.equal(ZERO_99)
        })
    })
    describe("fromSharesToWithdrawal", () => {
        /**
         *   function fromSharesToWithdrawal(uint256 amount) public view returns (uint256){
                return PRECISION.mul(amount).mul(getTotalValue()).div(totalSupply()).div(PRECISION); 
            }
         */
        it("Withdrawing 1 share out of 100 total with 100 value retuns 1", () => {
            const shares = PRECISION.mul(ONE).mul(TOTAL_SUPPLY_99).div(TOTAL_VALUE_99).div(PRECISION)
            const withdrawal = PRECISION.mul(shares).mul(TOTAL_SUPPLY_100).div(TOTAL_VALUE_100).div(PRECISION); 
            expect(withdrawal).to.equal(ONE)
        })

        it("Depositing and getting .99 shares and then withdrawing means I get back 1", () => {
            // Deposit 1, get 0.99 shares
            const shares = PRECISION.mul(ONE).mul(TOTAL_SUPPLY_99).div(TOTAL_VALUE_100).div(PRECISION)

            const newTotalSupply = TOTAL_SUPPLY_99.add(shares)

            const newTotalValue = TOTAL_VALUE_100.add(ONE)

            // Withdraw that 0.9 shares, get 1 back
            const withdrawal = PRECISION.mul(shares).mul(newTotalValue).div(newTotalSupply).div(PRECISION); 

            expect(withdrawal).to.equal(ONE)
        })
    })

    describe("sandwichAttack", () => {
        it("Depositing 100, for 100 shares, the other person deposits 1 and then withdraws, they get back 1, I can get back 100", () => {
            const shares = TOTAL_SUPPLY_100
            const newDepositShares = PRECISION.mul(ONE).mul(TOTAL_SUPPLY_100).div(TOTAL_VALUE_100).div(PRECISION)
            expect(newDepositShares).to.equal(ONE)

            const newSupply = TOTAL_SUPPLY_100.add(ONE)
            const newValue = TOTAL_VALUE_100.add(ONE)

            const newWithdrawal = PRECISION.mul(newDepositShares).mul(newValue).div(newSupply).div(PRECISION); 
            expect(newWithdrawal).to.equal(ONE)

            const lastSupply = newSupply.sub(newWithdrawal)
            const lastValue = newSupply.sub(newWithdrawal)

            const lastWithdraw = PRECISION.mul(shares).mul(lastValue).div(lastSupply).div(PRECISION); 
            expect(lastWithdraw).to.equal(TOTAL_SUPPLY_100) // I got back the same
        })

        it("Depositin 100 for 100 share, that double, then the other adds 1 and removes 1, I can get back 200", () => {
            const shares = TOTAL_SUPPLY_100
            const doubleValue = TOTAL_VALUE_100.mul(2)

            const newDepositShares = PRECISION.mul(ONE).mul(TOTAL_SUPPLY_100).div(doubleValue).div(PRECISION)

            expect(newDepositShares).to.equal(ONE.div(2)) // Half

            const newSupply = TOTAL_SUPPLY_100.add(newDepositShares)
            const newValue = doubleValue.add(ONE)

            const newWithdrawal = PRECISION.mul(newDepositShares).mul(newValue).div(newSupply).div(PRECISION); 

            expect(newWithdrawal).to.equal(ONE) // I get back my principal

            const lastSupply = newSupply.sub(newDepositShares)
            const lastValue = newValue.sub(newWithdrawal)

            const lastWithdraw = PRECISION.mul(shares).mul(lastValue).div(lastSupply).div(PRECISION); 
            expect(lastWithdraw).to.equal(doubleValue) // I got back 200 because it accrued interest before the deposit from the other account
        })
    })
});
