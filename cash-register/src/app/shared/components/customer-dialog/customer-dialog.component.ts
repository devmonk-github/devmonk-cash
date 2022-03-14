import {Component, Input, OnInit, ViewContainerRef} from '@angular/core';
import {DialogComponent} from "../../service/dialog";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.sass']
})
export class CustomerDialogComponent implements OnInit {
  @Input() customer: any;
  dialogRef: DialogComponent

  faTimes = faTimes
  loading = false
  fakeCustomer: any = {
    number: '45663',
    counter: false,
    name: 'Christy van Woudenberg',
    email: 'CristyvanWoudenberg@armyspy.com',
    address: {
      street: 'Slatuinenweg',
      number: 24,
      zip: '1057 KB',
      city: 'Amsterdam'
    }
  }
  fakeCustomers = [] = [
    {
      number: '45663',
      counter: false,
      name: 'Christy van Woudenberg',
      email: 'CristyvanWoudenberg@armyspy.com',
      address: {
        street: 'Slatuinenweg',
        number: 24,
        zip: '1057 KB',
        city: 'Amsterdam'
      }
    },
    {
      number: '99647',
      counter: false,
      name: 'Irem Botman',
      email: 'IremBotman@teleworm.us',
      address: {
        street: 'Van der Leeuwlaan',
        number: 39,
        zip: '3119 LP',
        city: 'Schiedam'
      }
    },
    {
      number: '666543',
      counter: false,
      name: 'Chaline Kruisselbrink',
      email: 'ChalineKruisselbrink@dayrep.com',
      address: {
        street: 'Hogenhof',
        number: 1,
        zip: '3861 CG',
        city: 'Nijkerk'
      }
    },
    {
      number: '55147',
      counter: false,
      name: 'Jovan Abbink',
      email: 'JovanAbbink@teleworm.us',
      address: {
        street: 'Turfsteker',
        number: 94,
        zip: '8447 DB',
        city: 'Heerenveen'
      }
    },
    {
      number: '33654',
      counter: false,
      name: 'Richano van der Zijden',
      email: 'RichanovanderZijden@teleworm.us',
      address: {
        street: 'Veilingweg',
        number: 192,
        zip: '4731 CW',
        city: 'Oudenbosch'
      }
    }
  ]

  constructor(private viewContainer: ViewContainerRef) {
    const _injector = this.viewContainer.parentInjector
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
  }

  close(flag: boolean): void {
    this.dialogRef.close.emit({action: false})
  }

  randNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min +1) + min);
  }

  setCustomer(): void {
    this.loading = true
    setTimeout( () => {
      this.customer = this.fakeCustomers[this.randNumber(0, this.fakeCustomers.length -1)]
      this.loading = false
    }, 1500)

  }

  save(): void {
    this.dialogRef.close.emit({action: true, customer: this.customer})
  }

}
