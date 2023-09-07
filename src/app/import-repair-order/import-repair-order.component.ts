import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ApiService } from '../shared/service/api.service';
import { ImportRepairOrderService } from '../shared/service/import-repair-order.service';
import { StepperComponent } from '../shared/_layout/components/common';

@Component({
  selector: 'import-repair-order',
  templateUrl: './import-repair-order.component.html',
  styleUrls: ['./import-repair-order.component.sass']
})
export class ImportRepairOrderComponent implements OnInit {

  stepperIndex: any = 0;
  parsedRepairOrderData: Array<any> = [];
  repairOrderDetailsForm: any;
  updateTemplateForm: any;
  importInprogress: boolean = false;
  businessDetails: any = {};
  location: any = {};
  stepperInstance: any;
  allFields: any = {
    first: [],
    last: [],
    all: []
  };
  referenceObj: any = {};
  iWorkStationId: any;
  iEmployeeId: any;
  @ViewChild('stepperContainer', { read: ViewContainerRef }) stepperContainer!: ViewContainerRef;

  constructor(
    private apiService: ApiService,
    private ImportRepairOrderService: ImportRepairOrderService
  ) { }

  ngOnInit(): void {
    this.businessDetails._id = localStorage.getItem('currentBusiness');
    this.location._id = localStorage.getItem('currentLocation');
    this.iWorkStationId = localStorage.getItem('currentWorkstation');
    this.iEmployeeId = JSON.parse(localStorage.getItem('currentUser') || '{}').userId;
  }

  ngAfterContentInit(): void {
    StepperComponent.bootstrap();
    setTimeout(() => {
      this.stepperInstance = StepperComponent.getInstance(this.stepperContainer.element.nativeElement);
    }, 200);
  }

  public moveToStep(step: any) {
    if (step == 'next') {
      this.stepperInstance.goNext();
    } else if (step == 'previous') {
      this.stepperInstance.goPrev();
    } else if (step == 'import') {
      this.importRepairOrder()
      this.stepperInstance.goNext();
    }
  }

  importRepairOrder() : any{
  try {
      this.importInprogress = true;
      const oData = {
        parsedRepairOrderData: this.parsedRepairOrderData,
        referenceObj: this.referenceObj,
        iBusinessId: this.businessDetails._id,
        iLocationId: this.location._id,
        iWorkStationId: this.iWorkStationId,
        iEmployeeId: this.iEmployeeId
      }
      const AllRecords = [];
      const { parsedRepairOrderData, oBody } = this.ImportRepairOrderService.mapTheImportRepairOrderBody(oData);
      //console.log("timportRepairOrder============s 2: ", JSON.parse(JSON.stringify(this.parsedRepairOrderData)));
      this.parsedRepairOrderData = parsedRepairOrderData;
      const aTransactionItem = JSON.parse(JSON.stringify(oBody?.transactionItems));
      for (let i = 0; i < aTransactionItem?.length; i++) {
        oBody.transactionItems = [aTransactionItem[i]];
        oBody.oTransaction.iCustomerId = aTransactionItem[i].iCustomerId;
        oBody.oTransaction.eSource = 'import-csv';
        oBody.oTransaction.oCustomer = aTransactionItem[i].oCustomer;
        oBody.eType = aTransactionItem[i].eType;
        oBody.payments = this.ImportRepairOrderService.mapPayment(aTransactionItem[i]);
        AllRecords.push(oBody);
        //return;
        if(aTransactionItem[i].eActivityItemStatus == 'delivered'){
          this.apiService.postNew('cashregistry', '/api/v1/till/historical-activity', oBody).subscribe((result: any) => {
            this.importInprogress = false;
            this.parsedRepairOrderData = [];
          }, (error) => {
            this.parsedRepairOrderData = [];
            console.error(error);
          });
        }else{
          this.apiService.postNew('cashregistry', '/api/v1/till/transaction', oBody).subscribe((result: any) => {
            this.importInprogress = false;
            this.parsedRepairOrderData = [];
          }, (error) => {
            this.parsedRepairOrderData = [];
            console.error(error);
          });
        }
      }
      //console.log("AllRecords.length" + AllRecords.length);
    } catch (error) {
      this.parsedRepairOrderData = [];
      console.log('Import Repair Order error', error);
    }
  }


  

}
