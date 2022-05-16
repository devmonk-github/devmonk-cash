import { Component, OnInit, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from '../toast';
import { CreateArticleGroupService } from '../../service/create-article-groups.service';
import { TransactionItem } from 'src/app/till/models/transaction-item.model';

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.sass']
})
export class AddExpensesComponent implements OnInit {

  @Input() public country = 'NL';
  @Output() countryChanged = new EventEmitter<string>();
  @Output() customerCountryChanged = new EventEmitter<string>();

  dialogRef: DialogComponent;

  private countryListByLang: any;
  value: any = 'Netherlands';
  faTimes = faTimes;
  filteredOptions$: Array<any> = [];
  expenseForm: any;
  focusValue = false;
  name: any;
  submitted = false;
  ledgerDescriptions = ['drinks', 'food', 'cleaning costs', 'office supplies', 'promotional material', 'shipping costs', 'car costs', 'Add money to cash register', 'Lost money/money difference'];
  selectedArticleGroup: any;
  allArticleGroups: any = [];
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private toastrService: ToastService,
    private createArticleGroupService: CreateArticleGroupService,
    private fb: FormBuilder
  ) {
    const _injector = this.viewContainerRef.injector;;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    this.getArticleGroup();
    this.expenseForm = this.fb.group({
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      expenseType: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
    });
  }

  get f() { return this.expenseForm.controls };

  private filter(value: string): { key: '', value: '' }[] {
    const filterValue = value.toLowerCase();
    const filteredList = this.countryListByLang.filter((optionValue: any) => optionValue.value.toLowerCase().includes(filterValue));
    return filteredList;
  }

  onModelChange(value: string) {
    this.filteredOptions$ = this.filter(value);
  }

  assignArticleGroup() {
    this.selectedArticleGroup = null;
    const expenseType = this.expenseForm.value.expenseType;
    this.selectedArticleGroup = this.allArticleGroups.find((o: any) => o.sSubCategory === this.expenseForm.value.expenseType);
    if (!this.selectedArticleGroup) {
      this.createArticleGroup(expenseType);
    }
  }
  getArticleGroup() {
    this.createArticleGroupService.checkArticleGroups('Expenses')
      .subscribe((res: any) => {
        if (res.data[0]) {
          this.allArticleGroups = res.data[0].result;
          this.selectedArticleGroup = this.allArticleGroups[0];
        } else {
          this.createArticleGroup('food');
        }
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }

  createArticleGroup(sSubCategory: string) {
    const articleBody = { name: 'Expenses', sCategory: 'expenses', sSubCategory }
    this.createArticleGroupService.createArticleGroup(articleBody)
      .subscribe((res: any) => {
        this.allArticleGroups.push(res.data);
        this.selectedArticleGroup = res.data;
      },
        (err: any) => {
          this.toastrService.show({ type: 'danger', text: err.message });
        });
  }

  changeSelected(event: any) {
    if (event) {
      this.country = event.key;
      this.value = event.value;
      this.customerCountryChanged.emit(event);
      this.countryChanged.emit(this.country);
      this.filteredOptions$ = this.filter('');
    }
  }

  close(data: any) {
    this.dialogRef.close.emit(data);
  }

  submit() {
    if (this.expenseForm.invalid) {
      return;
    }
    const { amount, expenseType, description } = this.expenseForm.value;

    const oArticleGroupMetaData = {
      aProperty: this.selectedArticleGroup.aProperty,
      sCategory: this.selectedArticleGroup.sCategory,
      sSubCategory: this.selectedArticleGroup.sSubCategory
    }
    const transactionItem = {
      sProductName: 'Expenses',
      sComment: description,
      nPriceIncVat: amount,
      nPurchasePrice: amount,
      iBusinessId: localStorage.getItem('currentBusiness'),
      iArticleGroupId: this.selectedArticleGroup._id,
      oArticleGroupMetaData,

      nTotal: amount,
      nOriginalTotal: amount,
      nPaymentAmount: amount,
      iDeviceId: localStorage.getItem('currentLocation'),
      iEmployeeId: localStorage.getItem('currentEmployee'),
      iLocationId: localStorage.getItem('currentLocation'),

      oType: {
        eTransactionType: 'expenses',
        bRefund: false,
        eKind: 'expenses',
        bDiscount: false,
      },
    }
    this.apiService.postNew('cashregistry', '/api/v1/till/add-expenses', transactionItem)
      .subscribe((res: any) => {
        this.toastrService.show({ type: 'success', text: res.message });
        this.close(res);
      }, err => {
        this.toastrService.show({ type: 'danger', text: err.message });
      });
  }
}