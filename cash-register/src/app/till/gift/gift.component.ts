/* eslint-disable @angular-eslint/component-selector */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faCheck, faSpinner, faPrint, faBan, faClone } from "@fortawesome/free-solid-svg-icons";
import { ToastService } from 'src/app/shared/components/toast';
import { ApiService } from 'src/app/shared/service/api.service';
import { CreateArticleGroupService } from 'src/app/shared/service/create-article-groups.service';
// import { TaxService } from "../../shared/service/tax.service";

@Component({
  selector: '[till-gift]',
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GiftComponent implements OnInit {
  @Input() item: any
  @Input() transactionItems: any;
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();
  @Output() createGiftCard = new EventEmitter<any>();
  faTimes = faTimes;
  faPlus = faPlus;
  faMinus = faMinus;
  numberIcon = faSpinner;
  faPrint = faPrint;
  faBan = faBan;
  faClone = faClone;
  checkingNumber: boolean = false
  constructor(
    private apiService: ApiService,
    private toastrService: ToastService,
    private createArticleGroupService: CreateArticleGroupService) { }

  ngOnInit(): void {
    this.checkNumber();
    this.checkArticleGroups();
    this.changeInPrice();
  }

  deleteItem(): void {
    this.itemChanged.emit('delete');
  }

  checkNumber(): void {
    this.item.isGiftCardNumberValid = false;
    const checkAvailabilty = this.transactionItems.find((o: any) => String(o.sGiftCardNumber) === String(this.item.sGiftCardNumber) && o.index !== this.item.index);
    if (this.item.sGiftCardNumber.toString().length < 4 || checkAvailabilty) {
      this.numberIcon = faBan;
      return;
    }
    this.numberIcon = faSpinner;
    this.checkingNumber = true;

    this.apiService.getNew('cashregistry', `/api/v1/till/check-availability?sGiftCardNumber=${this.item.sGiftCardNumber}`)
      .subscribe(data => {
        if (!data) {
          this.numberIcon = faCheck;
          this.item.isGiftCardNumberValid = true;
        } else {
          this.numberIcon = faBan;
        }
        this.checkingNumber = false;
      }, err => {
        this.checkingNumber = false;
      });
  }

  checkArticleGroups() {
    this.createArticleGroupService.checkArticleGroups('Giftcard')
      .subscribe((res: any) => {
        if (1 > res.data.length) {
          this.createArticleGroup();
        } else {
          this.item.iArticleGroupId = res.data[0].result[0]._id;
          this.item.oArticleGroupMetaData.sCategory = res.data[0].result[0].sCategory;
          this.item.oArticleGroupMetaData.sSubCategory = res.data[0].result[0].sSubCategory;
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  async createArticleGroup() {
    const articleBody = { name: 'Giftcard', sCategory: 'Giftcard', sSubCategory: 'Repair' };
    const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
    this.item.iArticleGroupId = result.data._id;
    this.item.oArticleGroupMetaData.sCategory = result.data.sCategory;
    this.item.oArticleGroupMetaData.sSubCategory = result.data.sSubCategory;
  }

  changeInPrice() {
    this.item.nPurchasePrice = this.item.price / 1.21;
  }

  create(): void {
    this.createGiftCard.emit('create');
  }

  duplicate(): void {
    this.itemChanged.emit('duplicate');
  }
}
