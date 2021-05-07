import { BigInt } from '@graphprotocol/graph-ts'
import { Deposit, Withdraw, Harvest } from '../generated/MyieldWMatic/MyieldWMatic'
import { Account, Vault, Protocol } from '../generated/schema'

const PROTOCOL_V1_ID = "v1"

const valuePerShare = (deposited: BigInt, shares: BigInt): BigInt => deposited.div(shares)

export function handleDeposit(event: Deposit): void {
  let protocol = Protocol.load(PROTOCOL_V1_ID)
  if(protocol == null) {
    protocol = new Protocol(PROTOCOL_V1_ID)
    protocol.lifetimeUsers = BigInt.fromI32(0)
    protocol.lifetimeDeposited = BigInt.fromI32(0)
    protocol.lifetimeHarvested = BigInt.fromI32(0)
    protocol.lifetimeTreasury = BigInt.fromI32(0)
  }

  const id = event.params.account.toHex()
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
    account.deposited = BigInt.fromI32(0)
    account.shares = BigInt.fromI32(0)
    account.earned = BigInt.fromI32(0)
    protocol.lifetimeUsers = protocol.lifetimeUsers.plus(BigInt.fromI32(1))
  }

  protocol.lifetimeDeposited = protocol.lifetimeDeposited.plus(event.params.amount)
  protocol.save()

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

  /** Protocol */ 
  let protocol = Protocol.load(PROTOCOL_V1_ID)

  protocol.lifetimeTreasury = protocol.lifetimeTreasury.plus(event.params.fees)
  protocol.lifetimeHarvested = protocol.lifetimeHarvested.plus(event.params.rewardsAmount)
  protocol.save()
}