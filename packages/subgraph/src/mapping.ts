import { DepositCall, WithdrawCall } from '../generated/Myield/Myield'
import { Account } from '../generated/schema'

export function handleDeposit(event: DepositCall): void {
  const id = event.from.toHex()
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
  }
  account.deposited =  account.deposited.plus(event.inputs.amount)
  account.shares = event.outputs.value0
  // This provides us with a ratio

  account.save()
}

export function handleWithdrawal(event: WithdrawCall): void {
  const id = event.from.toHex()
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
  }


 // do nothing just for now 
}