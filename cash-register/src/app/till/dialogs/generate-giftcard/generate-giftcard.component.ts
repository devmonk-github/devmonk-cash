import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {DialogComponent} from "../../../shared/service/dialog";
import {TaxService} from "../../../shared/service/tax.service";

@Component({
  selector: 'app-generate-giftcard',
  templateUrl: './generate-giftcard.component.html',
  styleUrls: ['./generate-giftcard.component.sass']
})
export class GenerateGiftcardComponent implements OnInit {

  faTimes = faTimes;
  dialogRef: DialogComponent
  card = {
    value: 34,
    number: Date.now(),
    tax: 21,
    taxHandling: "true"
  }
  taxes: any[] = []

  constructor(private viewContainer: ViewContainerRef, private taxService: TaxService) {
    const _injector = this.viewContainer.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  close(): void {
    this.dialogRef.close.emit({action: false})
  }

  ngOnInit(): void {
    this.taxes = this.taxService.getTaxRates()
  }

  save(): void {
    this.dialogRef.close.emit({card: this.card, action: true})
  }

}
