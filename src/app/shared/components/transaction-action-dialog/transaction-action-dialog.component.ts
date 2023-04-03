import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faCheck, faRefresh, faSearch, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import * as JsBarcode from 'jsbarcode';
import { TransactionDetailsComponent } from 'src/app/transactions/components/transaction-details/transaction-details.component';
import { ApiService } from '../../service/api.service';
import { DialogComponent, DialogService } from "../../service/dialog";
import { ReceiptService } from '../../service/receipt.service';
import { ToastService } from '../toast';

@Component({
  selector: 'app-transaction-action',
  templateUrl: './transaction-action-dialog.component.html',
  styleUrls: ['./transaction-action-dialog.component.scss']
})
export class TransactionActionDialogComponent implements OnInit {
  dialogRef: DialogComponent

  faTimes = faTimes;
  faSearch = faSearch;
  faSpinner = faSpinner;
  faRefresh = faRefresh;
  faCheck = faCheck;
  loading = false;
  showLoader = false;
  transaction: any = undefined;
  transactionDetail:any =undefined;
  activityItems: any;
  activity: any;
  printActionSettings: any;
  printSettings: any;
  nRepairCount: number = 0;
  nOrderCount: number = 0;
  aTypes = ['regular', 'order', 'repair', 'giftcard', 'repair_alternative'];
  aActionSettings = ['DOWNLOAD', 'PRINT_THERMAL', 'EMAIL', 'PRINT_PDF']
  aUniqueTypes: any = [];
  aRepairItems: any = [];
  aTemplates: any = [];
  employees:any =[];
  aRepairActionSettings: any;
  aRepairAlternativeActionSettings: any;
  usedActions: boolean = false;
  businessDetails: any;
  bRegularCondition: boolean = false;
  bOrderCondition: boolean = false;
  bGiftcardCondition: boolean = false;
  bProcessingTransaction: boolean = false;
  bRepairDisabled: boolean = false;
  bOrderDisabled: boolean = false;
  bRegularDisabled: boolean = false;
  bGiftCardDisabled : boolean = false;
  bRepairAlternativeDisabled : boolean = false;
  eType = 'cash-register-revenue';
  bReceiveNewsletter: boolean = false;
  iBusinessId: any = localStorage.getItem('currentBusiness');
  iWorkstationId: any = localStorage.getItem('currentWorkstation');

  constructor(
    private viewContainer: ViewContainerRef,
    private receiptService: ReceiptService,
    private toastService: ToastService,
    private apiService: ApiService,
    private dialogService:DialogService
  ) {
    const _injector = this.viewContainer.injector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {  
    this.dialogRef.contextChanged.subscribe((context: any) => {
      this.transaction = context.transaction;
      this.transactionDetail = context.transactionDetail;
      this.aTemplates = context.aTemplates;
      this.activityItems = context.activityItems;
      this.activity = context.activity;
      this.businessDetails = context.businessDetails;
      this.nOrderCount = context.nOrderCount;
      this.nRepairCount = context.nRepairCount;
      this.printActionSettings = context.printActionSettings;
      this.printSettings = context.printSettings;

      this.aRepairItems = this.activityItems.filter((item: any) => item.oType.eKind === 'repair');

      this.bRegularCondition = this.transaction.total > 0.02 || this.transaction.total < -0.02;
      this.bOrderCondition = this.nOrderCount === 1 && this.nRepairCount === 1 || this.nRepairCount > 1 || this.nOrderCount >= 1;

      if (this.bRegularCondition) this.aUniqueTypes.push('regular');
      if (this.bOrderCondition) this.aUniqueTypes.push('order');
      // console.log(this.transaction)
      if (this.transaction.aTransactionItemType.includes('giftcard')) {
        this.bGiftcardCondition = true;
        this.aUniqueTypes.push('giftcard')
      }
      this.aUniqueTypes = [...new Set(this.aUniqueTypes)]

    })
    this.listEmployee();
  }

  close(data: any): void {
    this.dialogRef.close.emit(this.usedActions)
  }

  listEmployee() {
    this.apiService.postNew('auth', '/api/v1/employee/list', { iBusinessId: this.iBusinessId }).subscribe((result:any)=>{
      if (result?.data?.length) {
        this.employees = this.employees.concat(result.data[0].result);
      }
    })
  }

  async performAction(type: any, action: any, index?: number) {
    this.usedActions = true;
    let oDataSource = undefined;
    let template = undefined;
    let pdfTitle = '';

    if (index != undefined && (type === 'repair' || type === 'repair_alternative')) {
      if(type == 'repair'){
        this.bRepairDisabled = true
      }else if(type == 'repair_alternative'){
        this.bRepairAlternativeDisabled = true
      }
      // console.log('repair items index=', index, this.aRepairItems[index], this.activityItems);
      oDataSource = this.aRepairItems[index];
      const aTemp = oDataSource.sNumber.split("-");
      oDataSource.sPartRepairNumber = aTemp[aTemp.length - 1];

      template = this.aTemplates.filter((template: any) => template.eType === type)[0];
      oDataSource.sBarcodeURI = this.generateBarcodeURI(false, oDataSource.sNumber);
      oDataSource.oCustomer = this.transaction.oCustomer
      oDataSource.businessDetails = this.businessDetails;
      oDataSource.sAdvisedEmpFirstName = this.transaction?.sAdvisedEmpFirstName || 'a';
      oDataSource.sBusinessLogoUrl = this.transaction.sBusinessLogoUrl
      pdfTitle = oDataSource.sNumber;

    } else if (type === 'regular') {
      this.bRegularDisabled = true;
      oDataSource = this.transaction;
      pdfTitle = this.transaction.sNumber;
      template = this.aTemplates.filter((template: any) => template.eType === 'regular')[0];

    } else if (type === 'giftcard') {
      this.bGiftCardDisabled = true;
      oDataSource = this.activityItems.filter((item: any) => item.oType.eKind === 'giftcard')[0];
      oDataSource.nTotal = oDataSource.nPaidAmount;
      oDataSource.sBarcodeURI = this.generateBarcodeURI(true, 'G-' + oDataSource.sGiftCardNumber);
      pdfTitle = oDataSource.sGiftCardNumber;
      template = this.aTemplates.filter((template: any) => template.eType === 'giftcard')[0];

    } else if (type === 'order') {
      this.bOrderDisabled = true;
      template = this.aTemplates.filter((template: any) => template.eType === 'order')[0];
      oDataSource = {
        ...this.activity,
        activityitems: this.activityItems,
        aTransactionItems: this.transaction.aTransactionItems
      };

      oDataSource.oCustomer = this.transaction.oCustomer
      oDataSource.businessDetails = this.businessDetails;
      oDataSource.sBusinessLogoUrl = this.transaction.sBusinessLogoUrl
      oDataSource.sAdvisedEmpFirstName = this.transaction?.sAdvisedEmpFirstName || 'a';

      let nTotalPaidAmount = 0;
      oDataSource.activityitems.forEach((item: any) => {
        item.sActivityItemNumber = item.sNumber;
        item.sOrderDescription = item.sProductName + '\n' + item.sDescription;
        nTotalPaidAmount += item.nPaidAmount;
      });
      oDataSource.nTotalPaidAmount = nTotalPaidAmount;
      oDataSource.sActivityNumber = this.transaction.activity.sNumber;

      pdfTitle = oDataSource.sActivityNumber;
    }

    if (action == 'PRINT_THERMAL') {
      this.receiptService.printThermalReceipt({
        oDataSource: oDataSource,
        printSettings: this.printSettings.filter((s: any) => s.sType === type),
        sAction: 'thermal',
        apikey: this.businessDetails.oPrintNode.sApiKey,
        title: this.transaction.sNumber,
        sType: type
      });
    } else if (action == 'EMAIL') {
      const response = await this.receiptService.exportToPdf({
        oDataSource: oDataSource,
        pdfTitle: pdfTitle,
        templateData: template,
        printSettings: this.printSettings.filter((s: any) => s.sType === type),
        sAction: 'sentToCustomer',
      });
      const body = {
        pdfContent: response,
        iTransactionId: this.transaction._id,
        receiptType: 'purchase-receipt',
        sCustomerEmail: oDataSource.oCustomer.sEmail
      }

      this.apiService.postNew('cashregistry', '/api/v1/till/send-to-customer', body).subscribe(
        (result: any) => {
          if (result) {
            this.toastService.show({ type: 'success', text: 'Mail send to customer.' });
          }
        }, (error: any) => {

        }
      )
    } else {
      const oSettings = this.printSettings.find((s: any) => s.sType === type && s.sMethod === 'pdf' && s.iWorkstationId === this.iWorkstationId)
      if (!oSettings && action === 'PRINT_PDF') {
        this.toastService.show({ type: 'danger', text: 'Check your business -> printer settings' });
        this.bRegularDisabled = false;
        return;
      }
      this.receiptService.exportToPdf({
        oDataSource: oDataSource,
        pdfTitle: pdfTitle,
        templateData: template,
        printSettings: oSettings,
        sAction: (action === 'DOWNLOAD') ? 'download' : 'print',
        sApiKey: this.businessDetails.oPrintNode.sApiKey
      });
      
      if(type === 'repair'){
        this.bRepairDisabled = false
      }else if(type === 'repair_alternative'){
        this.bRepairAlternativeDisabled = false
      }else if(type === 'regular'){
        this.bRegularDisabled = false
      }else if(type === 'giftcard'){
          this.bGiftCardDisabled = false
      }else if(type === 'order'){
        this.bOrderDisabled = false
      }    
    }
  }

  generateBarcodeURI(displayValue: boolean = true, data: any) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, data, { format: "CODE128", displayValue: displayValue });
    return canvas.toDataURL("image/png");
  }
  
  openTransactionDetail(transaction: any) {
    this.dialogService.openModal(TransactionDetailsComponent, 
      { 
        cssClass: "w-fullscreen mt--5", 
        context: { 
          transaction: transaction, 
          businessDetails: this.businessDetails, 
          eType: this.eType, 
          from: 'transactions-action',
          employeesList: this.employees
        }, 
        hasBackdrop: true, 
        closeOnBackdropClick: false, 
        closeOnEsc: false 
      }).instance.close.subscribe(
        res => {
          this.close(false);
          // if (res) this.routes.navigate(['business/till']);
        });
  }


  updateCustomer() {
    let customerDetails = JSON.parse(JSON.stringify(this.transaction.oCustomer));
    customerDetails.bNewsletter = this.bReceiveNewsletter;
    customerDetails.iBusinessId = this.businessDetails._id;
    this.apiService.putNew('customer', `/api/v1/customer/update/${this.businessDetails._id}/${this.transaction.iCustomerId}`, customerDetails).subscribe(
      (result: any) => {
        if (result?.message == "success") {
          this.toastService.show({ type: 'success', text: 'Customer details updated.' });
        } else {
          this.toastService.show({ type: 'warning', text: 'Error while updating customer details updated.' });
        }
      }, (error: any) => {
        this.toastService.show({ type: 'warning', text: 'Error while updating customer details updated.' });
      }
    )
  }
}
