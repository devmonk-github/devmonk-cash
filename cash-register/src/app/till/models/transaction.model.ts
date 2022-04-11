import {TransactionItem} from "./transaction-item.model";

export class Transaction {
  // TODO: Check which properties should be optional
  constructor(
    public _id: string | null,
    public iBusinessPartnerId: string | null,
    public iBusinessId: string,
    public sNumber: string | null,
    public eType: string,
    public eStatus: string,
    public iDeviceId: string,
    public iEmployeeId: string,
    public iLocationId: string,
    public items: TransactionItem[] | null
  ) {
  }
}

