import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Vault, Protocol, VaultPosition } from '../generated/schema'

export const loadVault = (vaultId: string): Vault => {
  let vault = Vault.load(vaultId)
  if(!vault){
    vault = new Vault(vaultId)
    vault.deposited = BigInt.fromI32(0)
    vault.shares = BigInt.fromI32(0)

    vault.lifetimeTreasury = BigInt.fromI32(0)
    vault.lifetimeHarvested = BigInt.fromI32(0)
    vault.lifetimeDeposited = BigInt.fromI32(0)
  }

  return vault as Vault
}

export const loadVaultPositions = (vaultId: string, account: string): VaultPosition => {
  const vaultPositionId = vaultId + account
  let vaultPosition = VaultPosition.load(vaultPositionId)
  if(!vaultPosition){
    vaultPosition = new VaultPosition(vaultPositionId)
    vaultPosition.vault = vaultId;
    vaultPosition.deposited = BigInt.fromI32(0)
    vaultPosition.earned = BigInt.fromI32(0)
    vaultPosition.shares = BigInt.fromI32(0)
    vaultPosition.account = account
  }

  return vaultPosition as VaultPosition
}

export const loadProtocol = (protocolId: string): Protocol => {
  let protocol = Protocol.load(protocolId)
  if(protocol == null) {
    protocol = new Protocol(protocolId)
    protocol.lifetimeUsers = BigInt.fromI32(0)
    protocol.lifetimeDeposited = BigInt.fromI32(0)
    protocol.lifetimeHarvested = BigInt.fromI32(0)
    protocol.lifetimeTreasury = BigInt.fromI32(0)
  }

  return protocol as Protocol
}


export const loadAccount = (accountId: string, protocol: Protocol): Account => {
  let account = Account.load(accountId)
  if (account == null) {
    account = new Account(accountId)
    account.deposited = BigInt.fromI32(0)
    account.shares = BigInt.fromI32(0)
    account.earned = BigInt.fromI32(0)
    // Protocol is passed only for new users
    if(protocol) {
      protocol.lifetimeUsers = protocol.lifetimeUsers.plus(BigInt.fromI32(1))
    }
  }
  return account as Account
}