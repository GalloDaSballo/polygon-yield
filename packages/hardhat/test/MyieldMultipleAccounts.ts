/* eslint-disable func-names */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ERC20, Myield } from "../typechain";
import { deploy } from "./helpers";

// Testing on matic sees to have issues, we can deploy here and then run the tests

describe("Multiple Account Tests tests", function () {

    describe("Multiple Deposits", function () {
        let contract: Myield;
        let admin: SignerWithAddress
        let second: SignerWithAddress
        let third: SignerWithAddress

        before(async function () {
            admin = await ethers.getNamedSigner("admin");
            second = (await ethers.getSigners())[0];
            third = (await ethers.getSigners())[0];

            console.log("admin", admin.address)
            console.log("deployer", second.address)
            contract = (await deploy("Myield", { args: [], connect: admin })) as Myield;
            const wMatic = (await ethers.getContractAt("Myield", "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", admin)) as ERC20
            await (await wMatic["approve(address,uint256)"](contract.address, ethers.constants.MaxUint256)).wait()

        });

        // it("I deposit 1 WMATIC first , I get 1 share", async function () {
        //     await (await contract["deposit(uint256)"](BigNumber.from("1000000000000000000"), {gasLimit: 2000000})).wait()
        //     const balance = await contract.balanceOf(admin.address)
        //     expect(balance).to.equal(BigNumber.from("1000000000000000000"));
        // });
    })
});
