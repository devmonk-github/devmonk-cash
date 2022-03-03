import {TransactionItem} from "./transaction-item.model";

export class Transaction {
  constructor(
    public _id: string,
    public iBusinessPartnerId: string,
    public iBusinessId: string,
    public sNumber: string,
    public eType: string,
    public eStatus: string,
    public iDeviceId: string,
    public iEmployeeId: string,
    public items?: [TransactionItem]
  ) {
  }
}

