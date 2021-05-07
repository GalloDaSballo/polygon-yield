import { BigInt } from '@graphprotocol/graph-ts'
import { Deposit, Withdraw, Harvest } from '../generated/MyieldWMatic/MyieldWMatic'
import { Account, Vault } from '../generated/schema'

const valuePerShare = (deposited: BigInt, shares: BigInt): BigInt => deposited.div(shares)

export function handleDeposit(event: Deposit): void {
  const id = event.params.account.toHex()
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
    account.deposited = BigInt.fromI32(0)
    account.shares = BigInt.fromI32(0)
    account.earned = BigInt.fromI32(0)
  }

  account.deposited = account.deposited.plus(event.params.amount)
  account.shares = account.shares.plus(event.params.shares)

  account.save()
}

export function handleWithdrawal(event: Withdraw): void {
  const id = event.params.account.toHex()
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
    account.deposited = BigInt.fromI32(0)
    account.shares = BigInt.fromI32(0)
    account.earned = BigInt.fromI32(0)
  }

  const value = valuePerShare(account.deposited, account.shares)
  const depositInitialValue = value.times(event.params.shares)
  const newValue = event.params.value

  account.earned = account.earned.plus(newValue.minus(depositInitialValue))

  account.shares = account.shares.minus(event.params.shares)
  account.deposited = account.deposited.minus(depositInitialValue)

  account.save()
}

export function handleHarvest(event: Harvest): void {
  const id = event.address.toHex()
  let vault = Vault.load(id)
  if(vault == null){
    vault = new Vault(id)
    vault.treasury = BigInt.fromI32(0)
    vault.totalHarvested = BigInt.fromI32(0)
  }

  vault.treasury = vault.treasury.plus(event.params.fees)
  vault.totalHarvested = vault.totalHarvested.plus(event.params.rewardsAmount)

  vault.save()
}