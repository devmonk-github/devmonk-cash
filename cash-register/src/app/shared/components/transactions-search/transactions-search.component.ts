import { Component, Input, OnInit, ViewContainerRef, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { DialogComponent } from "../../service/dialog";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { DialogService } from '../../service/dialog';
import { CustomerDetailsComponent } from '../customer-details/customer-details.component';
import { ApiService } from '../../service/api.service';
import { TranslateService } from '@ngx-translate/core';
import { TransactionItemsDetailsComponent } from '../transaction-items-details/transaction-items-details.component';

@Component({
  selector: 'app-transactions-search',
  templateUrl: './transactions-search.component.html',
  styleUrls: ['./transactions-search.component.scss']
})
export class TransactionsSearchComponent implements OnInit, AfterViewInit {
  @Input() customer: any;
  dialogRef: DialogComponent

  faTimes = faTimes
  faSearch = faSearch
  loading = false
  showLoader = false;
  totalData = 0;
  business: any = {}
  // customColumn = 'NAME';
  transactions: Array<any> = [];
  selectedWorkstations: Array<any> = [];
  selectedLocations: Array<any> = [];
  allColumns = ['Transaction Number', 'Transaction Type', 'Date', 'Actions'];
  requestParams: any = {
    searchValue: '',
    limit: 5,
    skip: 0,
  }

  page = 1;

  @ViewChildren('inputElement') inputElement!: QueryList<ElementRef>;

  constructor(
    private viewContainer: ViewContainerRef,
    private dialogService: DialogService,
    private apiService: ApiService,
    private translateService: TranslateService) {
    const _injector = this.viewContainer.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngAfterViewInit(): void {
    this.inputElement.first.nativeElement.focus();
  }

  ngOnInit(): void {
    this.business._id = localStorage.getItem("currentBusiness");
    this.requestParams.iBusinessId = this.business._id;
  }

  makeCustomerName = async (customer: any) => {
    if (!customer) {
      return '';
    }
    let result = '';
    if (customer.sSalutation) {
      await this.translateService.get(customer.sSalutation.toUpperCase()).subscribe((res) => {
        result += res + ' ';
      });
    }
    if (customer.sFirstName) {
      result += customer.sFirstName + ' ';
    }
    if (customer.sPrefix) {
      result += customer.sPrefix + ' ';
    }

    if (customer.sLastName) {
      result += customer.sLastName;
    }

    return result;
  }

  formatZip(zipcode: string) {
    if (!zipcode) {
      return '';
    }
    return zipcode.replace(/([0-9]{4})([a-z]{2})/gi, (original, group1, group2) => {
      return group1 + ' ' + group2.toUpperCase();
    });
  }

  makeCustomerAddress(address: any, includeCountry: boolean) {
    if (!address) {
      return '';
    }
    let result = '';
    if (address.street) {
      result += address.street + ' ';
    }
    if (address.houseNumber) {
      result += address.houseNumber + (address.houseNumberSuffix ? '' : ' ');
    }
    if (address.houseNumberSuffix) {
      result += address.houseNumberSuffix + ' ';
    }
    if (address.postalCode) {
      result += this.formatZip(address.postalCode) + ' ';
    }
    if (address.city) {
      result += address.city;
    }
    if (includeCountry && address.country) {
      result += address.country;
    }
    return result;
  }

  findTransactions() {
    this.transactions = [];
    this.requestParams.type = 'transaction';
    // this.requestParams.searchValue = '202',
    // this.requestParams.filterDates = this.filterDates;
    // this.requestParams.transactionStatus = this.transactionStatuses;
    // this.requestParams.invoiceStatus = this.invoiceStatus;
    // this.requestParams.importStatus = this.importStatus;
    // this.requestParams.methodValue = this.methodValue;
    // this.requestParams.transactionValue = this.transactionValue;
    // this.requestParams.iEmployeeId = this.employee && this.employee._id ? this.employee._id : '';
    this.requestParams.iDeviceId = undefined // we need to work on this once devides are available.
    this.requestParams.workstations = this.selectedWorkstations;
    this.requestParams.locations = this.selectedLocations;
    this.showLoader = true;
    this.apiService.postNew('cashregistry', '/api/v1/transaction/cashRegister', this.requestParams).subscribe((result: any) => {
      if (result && result.data && result.data.length && result.data[0] && result.data[0].result && result.data[0].result.length) {
        this.transactions = result.data[0].result;
        this.totalData = result.data[0].count.totalData;
      }
      this.showLoader = false;
    }, (error) => {
      this.showLoader = false;
    })
  }

  counter(i: number) {
    i = Math.round(i / this.requestParams.limit);
    return new Array(i);
  }

  // findTransactions() {
  //   // searchValue
  //   this.showLoader = true;
  //   this.customers = [];
  //   this.apiService.postNew('customer', '/api/v1/customer/list', this.requestParams)
  //     .subscribe(async (result: any) => {
  //       this.showLoader = false;
  //       if (result && result.data && result.data[0] && result.data[0].result) {
  //         this.customers = result.data[0].result;
  //         for (const customer of this.customers) {
  //           customer['NAME'] = await this.makeCustomerName(customer);
  //           customer['SHIPPING_ADDRESS'] = this.makeCustomerAddress(customer.oShippingAddress, false);
  //           customer['INVOICE_ADDRESS'] = this.makeCustomerAddress(customer.oInvoiceAddress, false);
  //           customer['EMAIL'] = customer.sEmail;
  //           customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
  //         }
  //       }
  //     },
  //       (error: any) => {
  //         this.customers = [];
  //         this.showLoader = false;
  //       })
  // }

  AddCustomer() {
    this.dialogService.openModal(CustomerDetailsComponent, { cssClass: "modal-xl", context: { mode: 'create' } }).instance.close.subscribe(async (result) => {
      let customer = result.customer;
      customer['NAME'] = await this.makeCustomerName(customer);
      customer['SHIPPING_ADDRESS'] = this.makeCustomerAddress(customer.oShippingAddress, false);
      customer['INVOICE_ADDRESS'] = this.makeCustomerAddress(customer.oInvoiceAddress, false);
      customer['EMAIL'] = customer.sEmail;
      customer['PHONE'] = (customer.oPhone && customer.oPhone.sLandLine ? customer.oPhone.sLandLine : '') + (customer.oPhone && customer.oPhone.sLandLine && customer.oPhone.sMobile ? ' / ' : '') + (customer.oPhone && customer.oPhone.sMobile ? customer.oPhone.sMobile : '')
      this.close({ action: false, customer: customer });
    });
  }

  openTransaction(transaction: any) {
    this.dialogService.openModal(TransactionItemsDetailsComponent, { cssClass: "modal-xl", context: { transaction } })
      .instance.close.subscribe(result => {
        if (result.type) {
          this.close(result);
        }
      });
  }

  close(data: any): void {
    this.dialogRef.close.emit(data)
  }

  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  setCustomer(customer: any): void {
    this.loading = true
    this.customer = customer;

    this.dialogRef.close.emit({ action: false, customer: this.customer })
  }

  // save(): void {
  //   this.dialogRef.close.emit({ action: true, customer: this.customer })
  // }

}
