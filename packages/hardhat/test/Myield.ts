/* eslint-disable func-names */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ERC20, Myield } from "../typechain";
import { deploy } from "./helpers";

// Testing on matic sees to have issues, we can deploy here and then run the tests

describe("Unit tests", function () {
    describe("I Deposit 1 Matic", function () {
        let contract: Myield;
        let admin: SignerWithAddress
        
        before(async function () {
            admin = await ethers.getNamedSigner("admin");
            console.log("admin", admin.address)
            contract = (await deploy("Myield", { args: [], connect: admin })) as Myield;
            const wMatic = (await ethers.getContractAt("Myield", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", admin)) as ERC20
            await (await wMatic["approve(address,uint256)"](contract.address, ethers.constants.MaxUint256)).wait()

            // Ensure admin balance is exactly 1.1 WMATIC
            const wMaticBalance = await wMatic.balanceOf(admin.address)
            if(wMaticBalance.lt("1100000000000000000")){
                console.log("Balance is below, please send 1.1 WMATIC")
                // Send rest to dev wallet
                await (await wMatic.transfer("0x3F86c3A4D4857a6F92999f214e2eD3aE7BB852C1", wMaticBalance)).wait()
                throw new Error("Balance is Off, send WMATIC to admin");
            }
            if(wMaticBalance.gt("1100000000000000000")){
                console.log("Balance is above sending back rest and continuing")
                await (await wMatic.transfer("0x3F86c3A4D4857a6F92999f214e2eD3aE7BB852C1", wMaticBalance.sub("1100000000000000000"))).wait()
            }
        });

        it("I deposit 1 WMATIC first , I get 1 share", async function () {
            await (await contract["deposit(uint256)"](BigNumber.from("1000000000000000000"), {gasLimit: 2000000})).wait()
            const balance = await contract.balanceOf(admin.address)
            expect(balance).to.equal(BigNumber.from("1000000000000000000"));
        });

        it("After Depositing 1 WMATIC, the balance of Want is 0 (everything is in AAVE)", async function () {
            const balance = await contract["balanceOfWant()"]()
            expect(balance).to.equal(BigNumber.from("0"));
        });

        it("After Depositing 1 WMATIC, the totalValue is greater than 1 but less than 1.1 (it accrued jus a little bit of interest)", async function () {
            const balance = await contract["getTotalValue()"]()
            expect(balance.lt(BigNumber.from("1100000000000000000")) && balance.gt(BigNumber.from("100000000000000000"))).to.equal(true);
        });

        it("After rebalancing, the totalValue is still very close to the previous value", async function () {
            await (await contract["rebalance()"]({gasLimit: 5000000})).wait() // Rebalance needs more gas
            const balance = await contract["getTotalValue()"]()
            expect(balance.lt(BigNumber.from("1100000000000000000")) && balance.gt(BigNumber.from("100000000000000000"))).to.equal(true);
        });

        it("I deposit 0.1 WMATIC after , I have less than 1.1 shares and more than 1.09", async function () {
            await (await contract["deposit(uint256)"](BigNumber.from("100000000000000000"),  {gasLimit: 2000000})).wait()
            const balance = await contract.balanceOf(admin.address)
            //I get less than 0.1 shares but more than 0.09 shares
            expect(balance.lt(BigNumber.from("1100000000000000000")) && balance.gt(BigNumber.from("1090000000000000000"))).to.equal(true);
        })

        it("After Calling reinvestRewards I withdraw all, I have more than 1.1 WMATIC (it accrued interest)", async function () {
            const toWithdraw = await contract.balanceOf(admin.address)
            await (await contract["reinvestRewards()"]({gasLimit: 2000000})).wait()
            await (await contract["withdraw(uint256)"](toWithdraw, {gasLimit: 2000000})).wait()
            const wMatic = (await ethers.getContractAt("Myield", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270")) as ERC20
            const balance = await wMatic.balanceOf(admin.address)
            expect(balance.gt(BigNumber.from("1100000000000000000"))).to.equal(true);
        })

        it("After withdrawing all, the contract has 0 balance of WMATIC", async function () {
            const balance = await contract["balanceOfWant()"]()
            expect(balance).to.equal(BigNumber.from("0"));
        })

        it("After withdrawing all, the contract has 0 total value", async function () {
            const totalValue = await contract["getTotalValue()"]()
            expect(totalValue).to.equal(BigNumber.from("0"));
        })
    });
});
