import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastService } from 'src/app/shared/components/toast';
import { DialogComponent } from 'src/app/shared/service/dialog';

@Component({
  selector: 'app-printer-tool',
  templateUrl: './printer-tool.component.html',
  styleUrls: ['./printer-tool.component.sass']
})
export class PrinterToolComponent implements OnInit {
  dialogRef: DialogComponent;
  faTimes = faTimes;
  zplCode = ''
  constructor(private viewContainerRef: ViewContainerRef,
    private toastService: ToastService,
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }
  ngOnInit() {
  }
  close(data: any) {
    this.dialogRef.close.emit(data);
  }
  save() { }
  prefillCommand(command: string) {
    // console.log({ command });
    this.zplCode = command;
  }
  //   Start: prefillCommand('~PS')
  // Stop: prefillCommand('~PP')
  // Calibrate: prefillCommand('~jc')
  // Blanc label: prefillCommand('^XA^FD0^XZ')
  // Que printer clean up: prefillCommand('~JA')

  // Media darkness: prefillCommand('^XA~SD18^XZ')
  // Alignment fix GK420t: prefillCommand('^XA^JSA^XZ')
}
