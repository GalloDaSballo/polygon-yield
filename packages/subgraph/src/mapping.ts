import { Deposit, Withdraw, Harvest } from '../generated/MyieldWMatic/MyieldWMatic'
import { loadAccount, loadProtocol, loadVault, loadVaultPositions } from './utils'

const PROTOCOL_V1_ID = "v1"

export function handleDeposit(event: Deposit): void {
  const vaultId = event.address.toHex()
  const vault = loadVault(vaultId)

  vault.lifetimeDeposited = vault.lifetimeDeposited.plus(event.params.amount)
  vault.deposited = vault.deposited.plus(event.params.amount)
  vault.shares = vault.shares.plus(event.params.shares)

  let protocol = loadProtocol(PROTOCOL_V1_ID)

  const accountId = event.params.account.toHex()
  let account = loadAccount(accountId, protocol)

  // TODO, convert from asset to USD
  protocol.lifetimeDeposited = protocol.lifetimeDeposited.plus(event.params.amount)
  protocol.save()

  // TODO, convert from asset to USD
  account.deposited = account.deposited.plus(event.params.amount)
  account.shares = account.shares.plus(event.params.shares)
  account.save()

  let vaultPosition = loadVaultPositions(vault.id, account.id)
  vaultPosition.deposited = vaultPosition.deposited.plus(event.params.amount)
  vaultPosition.shares = vaultPosition.shares.plus(event.params.shares)
  vaultPosition.save()

  
}

export function handleWithdrawal(event: Withdraw): void {
  const id = event.params.account.toHex()
  let account = loadAccount(id, null)

  const vaultId = event.address.toHex()
  let vault = loadVault(vaultId)

  // initial value is deposited / shares * shares withdrawing
  const depositInitialValue = account.deposited.times(event.params.shares).div(account.shares)
  const newValue = event.params.value

  account.earned = account.earned.plus(newValue.minus(depositInitialValue))

  account.shares = account.shares.minus(event.params.shares)
  account.deposited = account.deposited.minus(depositInitialValue)

  let vaultPosition = loadVaultPositions(vault.id, account.id)
  vaultPosition.deposited = vaultPosition.deposited.minus(depositInitialValue)
  vaultPosition.shares = vaultPosition.shares.minus(event.params.shares)
  vaultPosition.save()

  vault.shares = vault.shares.minus(event.params.shares)
  vault.deposited = vault.deposited.minus(depositInitialValue)

  account.save()
}

export function handleHarvest(event: Harvest): void {
  const id = event.address.toHex()
  let vault = loadVault(id)

  vault.lifetimeTreasury = vault.lifetimeTreasury.plus(event.params.fees)
  vault.lifetimeHarvested = vault.lifetimeHarvested.plus(event.params.rewardsAmount)
  vault.save()

  /** Protocol */ 
  let protocol = loadProtocol(PROTOCOL_V1_ID)

  // TODO: Convert these to lifetime in USD
  protocol.lifetimeTreasury = protocol.lifetimeTreasury.plus(event.params.fees)
  protocol.lifetimeHarvested = protocol.lifetimeHarvested.plus(event.params.rewardsAmount)
  protocol.save()
}