import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'import-gift-card-file',
  templateUrl: './import-gift-card-file.component.html',
  styleUrls: ['./import-gift-card-file.component.sass']
})

export class GiftCardFileImportComponent implements OnInit {

  delimiter: string = ';';
  stepperIndex: any = 0;
  importForm: any;

  @Input() parsedGiftCardData!: Array<any>;
  @Output() parsedGiftCardDataChange: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();
  @Output() moveToStep: EventEmitter<any> = new EventEmitter();
  @Input() allFields: any;
  
  faTimes = faTimes;

  constructor(
    private csvParser: NgxCsvParser,
  ) { }

  private readonly _uploadedFile: BehaviorSubject<any> = new BehaviorSubject(null);
  public get uploadedFile(): BehaviorSubject<any> {
    return this._uploadedFile;
  }
  private subscription!: Subscription;
  public readonly control = new FileUploadControl(
    { listVisible: true, accept: ['text/csv'], discardInvalid: true, multiple: false },
    FileUploadValidators.filesLimit(1)
  );

  ngOnInit(): void {
    this.subscription = this.control.valueChanges.subscribe((values: Array<File>) => {
      if (values?.length) {
        this.csvParser.parse(values[0], { header: true, delimiter: this.delimiter })
          .pipe().subscribe((result: any) => {
            this.parsedGiftCardData = result;
            this.parsedGiftCardDataChange.emit(this.parsedGiftCardData);
          }, (error: NgxCSVParserError) => {
            this.parsedGiftCardData = [];
            this.parsedGiftCardDataChange.emit(this.parsedGiftCardData);
          });
      } else {
        this.parsedGiftCardData = [];
        this.parsedGiftCardDataChange.emit(this.parsedGiftCardData);
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Function for go to next step
  nextStep(step: string) {
    this.moveToStep.emit(step);
  }

  // Function for validate file import
  validateImport(): boolean {
    return !this.delimiter.trim() || !this.parsedGiftCardData.length;
  }
}
