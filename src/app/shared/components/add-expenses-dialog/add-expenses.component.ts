import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '../toast';
import { CreateArticleGroupService } from '../../service/create-article-groups.service';
import { TaxService } from '../../service/tax.service';
import { TillService } from '../../service/till.service';

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.sass']
})
export class AddExpensesComponent implements OnInit {

  @Input() public country = 'NL';
  @Input() public taxes: Array<any> = [];
  @Output() countryChanged = new EventEmitter<string>();
  @Output() customerCountryChanged = new EventEmitter<string>();

  dialogRef: DialogComponent;
  faTimes = faTimes;
  expenseForm: any;
  focusValue = false;
  name: any;
  submitted = false;
  ledgerDescriptions = [
    { title: 'drinks', type: 'negative', eDefaultArticleType: 'expense-drinks' },
    { title: 'food', type: 'negative', eDefaultArticleType: 'expense-food' },
    { title: 'cleaning costs', type: 'negative', eDefaultArticleType: 'expense-cleaning-cost' },
    { title: 'office supplies', type: 'negative', eDefaultArticleType: 'expense-office-supplies' },
    { title: 'promotional material', type: 'negative', eDefaultArticleType: 'expense-promotional-material' },
    { title: 'shipping costs', type: 'negative', eDefaultArticleType: 'expense-shipping-cost' },
    { title: 'car costs', type: 'negative', eDefaultArticleType: 'expense-car-cost' },
    { title: 'Add money to cash register', type: 'positive', eDefaultArticleType: 'expense-add-to-cash' },
    { title: 'Lost money/money difference', type: 'negative', eDefaultArticleType: 'expense-lost-money' },
  ];
  selectedArticleGroup: any;
  allArticleGroups: any = [];
  currentEmployeeId: any;
  paymentMethod: any;
  // nVatRate: any;
  iLocationId: any = localStorage.getItem('currentLocation');
  iBusinessId: any = localStorage.getItem('currentBusiness');
  iWorkstationId: any = localStorage.getItem('currentWorkstation');
  bLoading = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private toastrService: ToastService,
    private createArticleGroupService: CreateArticleGroupService,
    private fb: FormBuilder,
    private tillService: TillService
    // private taxService: TaxService
  ) {
    const _injector = this.viewContainerRef.injector;;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
    this.paymentMethod = this.dialogRef.context.paymentMethod;
  }

  async ngOnInit() {
    const value = localStorage.getItem('currentEmployee');
    // this.nVatRate = await this.taxService.fetchDefaultVatRate({ iLocationId: iLocationId });
    if (value) {
      this.currentEmployeeId = JSON.parse(value)._id;
    }
    // this.getArticleGroup();
    this.expenseForm = this.fb.group({
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      expenseType: new FormControl('', [Validators.required]),
      tax: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
    });
  }

  get f() { return this.expenseForm.controls };

  // assignArticleGroup(type:any) {
  //   this.selectedArticleGroup = null;
  //   const expenseType = this.expenseForm.value.expenseType;
  //   this.selectedArticleGroup = this.allArticleGroups.find((o: any) => o.sSubCategory === this.expenseForm.value.expenseType);
  //   if (!this.selectedArticleGroup) {
  //     this.createArticleGroup(expenseType);
  //   }
  // }
  // getArticleGroup(eDefaultArticleGroup:string) {
    
  //   this.createArticleGroupService.checkArticleGroups(eDefaultArticleGroup).subscribe((result: any) => {
  //     if (result?.data) {
  //       this.allArticleGroups = result.data;
  //       this.selectedArticleGroup = this.allArticleGroups[0];
  //     } 
  //     // else {
  //     //   this.createArticleGroup('food');
  //     // }
  //   }, err => {
  //     this.toastrService.show({ type: 'danger', text: err.message });
  //   });
  // }

  async createArticleGroup(sSubCategory: string) {
    const articleBody = { name: 'expenses', sCategory: 'expenses', sSubCategory };
    const result: any = await this.createArticleGroupService.createArticleGroup(articleBody);
    this.allArticleGroups.push(result.data);
    this.selectedArticleGroup = result.data;
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  async submit() {
    if (this.expenseForm.invalid) return;
    this.bLoading = true;
    const { amount, expenseType, description, tax } = this.expenseForm.value;

    const _result: any = await this.createArticleGroupService.checkArticleGroups(expenseType.eDefaultArticleType).toPromise();

    const oArticleGroup = _result.data;
    
    const oArticleGroupMetaData = {
      aProperty: oArticleGroup?.aProperty,
      sCategory: oArticleGroup?.sCategory,
      sSubCategory: oArticleGroup?.sSubCategory,
      oName: oArticleGroup?.oName
    }
    const oPayment = {
      iPaymentMethodId: this.paymentMethod._id,
      sMethod: this.paymentMethod.sName.toLowerCase(),
      nAmount: (expenseType?.type === 'negative') ? -(amount) : amount,
      sComment: description
    };
    const transactionItem = {
      sProductName: expenseType.title,
      sComment: description,
      nPriceIncVat: amount,
      nPurchasePrice: amount,
      iBusinessId: this.iBusinessId,
      iArticleGroupId: oArticleGroup?._id,
      iArticleGroupOriginalId: oArticleGroup?._id,
      oArticleGroupMetaData,
      iStatisticsId: this.tillService.iStatisticsId,
      nTotal: (expenseType?.type === 'negative') ? -(amount) : amount,
      nPaymentAmount: (expenseType?.type === 'negative') ? -(amount) : amount,
      nRevenueAmount: (expenseType?.type === 'negative') ? -(amount) : amount,
      iWorkstationId: this.iWorkstationId,
      iEmployeeId: this.currentEmployeeId,
      iLocationId: this.iLocationId,
      nVatRate: tax,
      oType: {
        eTransactionType: 'expenses',
        bRefund: false,
        eKind: 'expenses',
        bDiscount: false,
      },
      oPayment,
      sDayClosureMethod: this.tillService.settings?.sDayClosureMethod || 'workstation',
    }
    this.apiService.postNew('cashregistry', '/api/v1/till/add-expenses', transactionItem)
      .subscribe((res: any) => {
        this.bLoading = true;
        this.toastrService.show({ type: 'success', text: res.message });
        this.close(res);
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }
}
