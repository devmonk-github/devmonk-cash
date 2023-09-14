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
      let aAllRecords = [];
      const { parsedRepairOrderData, oBody } = this.ImportRepairOrderService.mapTheImportRepairOrderBody(oData);
      //console.log("timportRepairOrder============s 2: ", JSON.parse(JSON.stringify(this.parsedRepairOrderData)));
      this.parsedRepairOrderData = parsedRepairOrderData;
      const aTransactionItem = JSON.parse(JSON.stringify(oBody?.transactionItems));
      console.log(aTransactionItem?.length, aTransactionItem)
      for (let i = 0; i < aTransactionItem?.length; i++) {
        oBody.transactionItems = [aTransactionItem[i]];
        oBody.oTransaction.iCustomerId = aTransactionItem[i].iCustomerId;
        oBody.oTransaction.eSource = 'import-csv';
        oBody.oTransaction.oCustomer = aTransactionItem[i].oCustomer;
        oBody.eType = aTransactionItem[i].eType;
        oBody.payments = this.ImportRepairOrderService.mapPayment(aTransactionItem[i]);
        
        let oCopy = {...oBody}
        aAllRecords.push(oCopy);
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
      console.log('All records info', aAllRecords.length,  aAllRecords)
      //let limit = 1300;
      //WHILE LOOP
      // while (aAllRecords.length) {
      //   console.log("--- START LOOP ---")
      //   let aTransaction =  aAllRecords.splice(0, limit);
      //   console.log('in loop total length: ', aAllRecords.length, aTransaction.length);
      //   console.log('aTransaction info: ', aTransaction);
      //   for(const transaction of aTransaction){
      //     if(transaction.transactionItems[0].eActivityItemStatus == 'delivered'){
      //       // await this.apiService.postNew('cashregistry', '/api/v1/till/historical-activity', transaction);
      //     }else{
      //       // await this.apiService.postNew('cashregistry', '/api/v1/till/transaction', transaction);
      //     }
      //   }
      // }

      //FOR LOOP
      // for (let i = 0; i < nTotalLoop; i++) {
      //     console.log("Repair Loop execute", i);
      //     let skip = i * limit;
      //     try {
      //         console.log('--- STARTING ---')
      //         let aTransactions = aAllRecords.slice(skip, (skip + limit));
      //         console.log('skip', skip);
      //         console.log('aTransactions info', aTransactions.length, (skip + limit));
      //         for(const transaction of aTransactions){
      //           console.log(transaction.transactionItems)
      //           
      //         }
      //         console.log('--- ENDING ---')
      //     } catch (error) {
      //       this.importInprogress = false;
      //       this.parsedRepairOrderData = [];
      //       console.error(error);
      //     }
      // }
    } catch (error) {
      this.parsedRepairOrderData = [];
      console.log('Import Repair Order error', error);
    }
  }

}
