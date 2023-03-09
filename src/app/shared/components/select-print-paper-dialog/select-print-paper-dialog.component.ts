import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';
import { ToastService } from '../toast';

@Component({
  selector: 'app-select-print-paper-dialog',
  templateUrl: './select-print-paper-dialog.component.html',
  styleUrls: ['./select-print-paper-dialog.component.sass']
})
export class SelectPrintPaperDialogComponent implements OnInit {

  dialogRef: DialogComponent;
  faTimes = faTimes;
  iBusinessId: any = localStorage.getItem('currentBusiness');
  iLocationId: any = localStorage.getItem('currentLocation');
  printersList:any;
  oWorkstation:any;
  oSelectedPrinter:any;
  sSelectedPaper:any;
  aPapers:any;
  type:any;
  template:any;
  
  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private toastService: ToastService,
  ) { 
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit() {
    // console.log({ type:this.type, workstation:this.oWorkstation, template:this.template, paper: this.sSelectedPaper });
    if (this.oWorkstation[this.template] && this.oWorkstation[this.template][this.type] && this.oWorkstation[this.template][this.type]?.nPrinterId) {
      this.oSelectedPrinter = this.printersList.find((printer: any) => printer.id === this.oWorkstation[this.template][this.type]?.nPrinterId)
      if (this.oSelectedPrinter && !this.sSelectedPaper){
        this.selectedPrinterChange();
      } else if(this.oSelectedPrinter) {
        this.aPapers = Object.keys(this.oSelectedPrinter?.capabilities?.papers) || [];    
      }
      
      // console.log(this.oSelectedPrinter, this.sSelectedPaper);
    }
  }

  selectedPrinterChange(){
    this.aPapers = [];
    this.sSelectedPaper = null;
    this.aPapers = Object.keys(this.oSelectedPrinter?.capabilities?.papers) || [];
  }
  
  groupByFn = (item: any) => item.computer.name;
 
  close(data: any) {
    if(data) {
      this.dialogRef.close.emit({ action:true, oSelectedPrinter: this.oSelectedPrinter, sSelectedPaper: this.sSelectedPaper});
    } else {
      this.dialogRef.close.emit({action: data});
    }
  }
}
