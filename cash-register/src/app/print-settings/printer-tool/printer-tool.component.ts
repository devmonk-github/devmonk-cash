import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from 'src/app/shared/components/toast';
import { DialogComponent } from 'src/app/shared/service/dialog';
import { PrintService } from 'src/app/shared/service/print.service';

@Component({
  selector: 'app-printer-tool',
  templateUrl: './printer-tool.component.html',
  styleUrls: ['./printer-tool.component.sass']
})
export class PrinterToolComponent implements OnInit {
  dialogRef: DialogComponent;
  faTimes = faTimes;
  zplCode = ''
  commands = {
    Start: '~PS',
    Stop: '~PP',
    Calibrate: '~jc',
    BlancLabel: '^XA^FD0^XZ',
    QuePrinterCleanUp: '~JA',
    MediaDarkness: '^XA~SD18^XZ',
    AlignmentFixGK420t: '^XA^JSA^XZ',
  }
  iBusinessId = ''
  iLocationId = ''
  computerId = '394051'
  printerId = '70808882'

  constructor(private viewContainerRef: ViewContainerRef,
    private toastService: ToastService,
    private printService: PrintService,

  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }
  ngOnInit() {
    this.iBusinessId = localStorage.getItem('currentBusiness') || '';
    this.iLocationId = localStorage.getItem('currentLocation') || '';
  }
  close(data: any) {
    this.dialogRef.close.emit(data);
  }
  async save() {
    if (!this.zplCode) return;
    const computerId = '394051', printerId = '70808882'

    const printRawContentResult: any = await this.printService.printRawContent(this.iBusinessId, this.zplCode, printerId, computerId, 1, { title: 'Print label' })
    console.log({ printRawContentResult });
    if (printRawContentResult) {
      this.toastService.show({
        type: 'success',
        title: 'deviceStatus: ' + printRawContentResult?.deviceStatus,
        text: printRawContentResult?.status
      })
    }
  }
  clear() {
    this.zplCode = ''
  }
  prefillCommand(command: string) {
    // console.log({ command });
    this.zplCode = command;
  }

}
