import { ExtraService } from "./extra-service.model";
import { EdiProduct } from "./edi-product.model";
import { Property } from "./property.model";
import { Payment } from "./payment.model";
import { BusinessProductMetadata } from "./business-product-metadata.model";

export class TransactionItem {
  constructor(
    // TODO: Check which properties should be optional
    public sProductName: string,
    public sComment: string,
    public sProductNumber: string,
    public nPriceIncVat: number,
    public nPurchasePrice: number,
    public nProfit: number,
    public bEntryMethodCustomerValue: boolean | null,
    public nVatRate: number,
    public nQuantity: number,
    public nReceivedQuantity: number | null,

    public aExtraServices: [ExtraService] | null,
    public iProductId: string,
    public sEan: string,
    public sArticleNumber: string,
    public aImage: [string],
    public nMargin: number,
    public nExtraLabel: number | null,
    public oEdiProduct: EdiProduct | null,
    public iBusinessPartnerId: string | null,
    public iBusinessId: string,

    public iArticleGroupId: string | null,
    public oArticleGroupMetaData: { aProperty: [Property] } | null,
    public aPayments: [Payment] | null,
    public bPayLater: boolean,
    public bDeposit: boolean,
    public sProductCategory: string,
    public sGiftCardNumber: string | null,
    public iParentTransactionDetailId: string | null,
    public iGiftCardTransaction: string | null,
    // public nOriginalQuantity: number, Not needed

    public nTotal: number,
    public nOriginalTotal: number,
    public nPaymentAmount: number,
    public nPaidLaterAmount: number,
    public bDiscount: boolean,
    public bDiscountPercent: boolean,
    public nDiscountValue: number,
    public nRefundAmount: number,
    public nProductSize: number | null,
    public nProductSizeFor: string | null,

    public dEstimatedDate: Date | null,
    public dEstimatedDateString: string | null,
    public iBrandId: string | null,
    public iBusinessProductId: string | null,
    public oBusinessProductMetaData: BusinessProductMetadata | null,
    public eStatus: string,
    public iDeviceId: string,
    public iEmployeeId: string,
    public iLocationId: string,
    public sBagNumber: string,

    //Optional here, since we don't know the transaction id when we create one
    public iTransactionId: string | null,
    public oType: {
      eTransactionType: string,
      bRefund: boolean,
      nStockCorrection: number,
      eKind: string,
      bDiscount: boolean,
      bPrepayment: boolean,
    },
    public iActivityItemId: any) { }

}
