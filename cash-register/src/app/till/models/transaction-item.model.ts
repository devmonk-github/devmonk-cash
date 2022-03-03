import {ExtraService} from "./extra-service.model";
import {EdiProduct} from "./edi-product.model";
import {Property} from "./property.model";
import {Payment} from "./payment.model";
import {BusinessProductMetadata} from "./business-product-metadata.model";

export class TransactionItem {
  constructor(
    // TODO: Check which properties should be optional
    public sProductName: string,
    public sComment: string,
    public sProductNumber: string,
    public nPriceIncVat: number,
    public nPurchasePrice: number,
    public nProfit: number,
    public bEntryMethodCustomerValue: boolean,
    public nVatRate: number,
    public nQuantity: number,
    public nReceivedQuantity: number,
    public aExtraServices : [ExtraService],
    public iProductId: string,
    public sEan: string,
    public sArticleNumber: string,
    public aImage: [string],
    public nMargin: number,
    public nExtraLabel: number,
    public oEdiProduct: EdiProduct,
    public iBusinessPartnerId: string,
    public iBusinessId: string,
    public iArticleGroupId: string,
    public oArticleGroupMetaData: { aProperty: [Property]},
    public aPayments: [Payment],
    public eType: string,
    public eBookkeepingType: string,
    public bPayLater: boolean,
    public bDeposit: boolean,
    public sProductCategory: string,
    public sGiftCardNumber: string,
    public iParentTransactionDetailId: string,
    public iGiftCardTransaction: string,
    public nOriginalQuantity: number,
    public nTotal: number,
    public nOriginalTotal: number,
    public nPaidLaterAmount: number,
    public bDiscount: boolean,
    public nRefundAmount: number,
    public nProductSize: number,
    public nProductSizeFor: string,
    public dEstimatedDate: Date,
    public dEstimatedDateString: string,
    public iBrandId: string,
    public iBusinessProductId: string,
    public oBusinessProductMetaData: BusinessProductMetadata,
    public eStatus: string,
    public iDeviceId: string,
    public iEmployeeId: string,
    //Optional here, since we don't know the transaction id when we create one
    public iTransactionId? : string,

  ) {
  }

}




