import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes, faArrowDown, faArrowUp, faMinus } from '@fortawesome/free-solid-svg-icons'
import { DialogService } from "../../shared/service/dialog";
import { DiscountDialogComponent } from "../dialogs/discount-dialog/discount-dialog.component";
import { PriceService } from "../../shared/service/price.service";
import { ApiService } from 'src/app/shared/service/api.service';
import { ToastService } from 'src/app/shared/components/toast';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-product]',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
})
export class ProductComponent implements OnInit {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faMinus = faMinus;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  typeArray = ['regular', 'return'];
  collapsedBtn: Boolean = false;

  constructor(private dialogService: DialogService,
    private priceService: PriceService,
    private apiService: ApiService,
    private toastrService: ToastService) { }

  ngOnInit(): void {
    this.fetchArticleGroupInfo();
  }

  fetchArticleGroupInfo() {
    const iBusinessId = localStorage.getItem('currentBusiness');
    this.apiService.getNew('core', `/api/v1/business/article-group/${this.item.iArticleGroupId}?iBusinessId=${iBusinessId}`).
      subscribe((res: any) => {
        this.item.oArticleGroupMetaData.aProperty = res.data.aProperty;
        if (res.data.aBusinessPartner) {
          const marginData = res.data.aBusinessPartner.find((o: any) => o.iBusinessPartnerId === this.item.iSupplierId);
          this.item.nMargin = marginData?.nMargin || 1;
          this.item.nPurchasePrice = this.item.nPurchasePrice || 0;
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });

  }

  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

  getDiscount(item: any): string {
    return this.priceService.getDiscount(item.nDiscount || 0);
  }

  getTotalDiscount(item: any): string {
    return this.priceService.getDiscountValue(item);
  }

  getTotalPrice(item: any): string {
    return this.priceService.getArticlePrice(item)
  }

  changeInbrokenAmount(item: any) {
    if (item.nBrokenProduct < 0) {
      item.nBrokenProduct = 0;
    }
    if (item.quantity < item.nBrokenProduct) {
      item.nBrokenProduct = item.quantity;
    }
  }

  getColorCode(item: any): string {
    const { eTransactionItemType } = item;
    if (item.tType === 'refund') {
      return '#f7422e';
    }
    switch (eTransactionItemType) {
      case 'regular':
        return '#4ab69c';
      case 'broken':
        return '#f0e959';
      case 'return':
        return '#f7422e';
      default:
        return '#4ab69c';
    }
  }

  changeTypeArray() {
    if (!this.item.oType.refund) {
      this.item.price = -this.item.price;
    }
  }

  openDiscountDialog(): void {
    this.dialogService.openModal(DiscountDialogComponent, { context: { item: JSON.parse(JSON.stringify(this.item)) } })
      .instance.close.subscribe((data) => {
        if (data.item && data.item.nDiscount) {
          this.item.nDiscount = data.item.nDiscount
        }
      })
  }

  updatePayments(): void {
    this.itemChanged.emit('update');
  }
}
