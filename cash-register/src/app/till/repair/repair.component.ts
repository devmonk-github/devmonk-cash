import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { faTimes, faPlus, faMinus, faUpload } from "@fortawesome/free-solid-svg-icons";
import { DialogService } from 'src/app/shared/service/dialog';
import { PriceService } from 'src/app/shared/service/price.service';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[till-repair]',
  templateUrl: './repair.component.html',
  styleUrls: ['./repair.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RepairComponent {
  @Input() item: any
  @Input() taxes: any
  @Output() itemChanged = new EventEmitter<any>();

  faTimes = faTimes;
  faPlus = faPlus;
  faMinus = faMinus;
  faUpload = faUpload;

  typeArray = ['regular', 'broken', 'return'];
  showDeleteBtn: boolean = false;

  constructor(private priceService: PriceService,
    private dialogService: DialogService) { }

  updatePayments(): void {
    this.itemChanged.emit('update');
  }
  deleteItem(): void {
    this.itemChanged.emit('delete')
  }

  openImageModal() {
    this.dialogService.openModal(ImageUploadComponent, { cssClass: "modal-m", context: { mode: 'create' } })
      .instance.close.subscribe(result => {
        if (result.url)
          this.item.aImage.push(result.url);
      });
  }

  getTotalPrice(item: any): void {
    return this.priceService.calculateItemPrice(item)
  }

  removeImage(index: number): void {
    console.log(index);
    this.item.aImage.splice(index, 1);
  }
}
