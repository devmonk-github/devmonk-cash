import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FileUploadControl, FileUploadValidators } from '@iplab/ngx-file-upload';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ToastService } from 'src/app/shared/components/toast';

@Component({
  selector: 'import-file-import',
  templateUrl: './file-import.component.html',
  styleUrls: ['./file-import.component.sass']
})
export class FileImportComponent implements OnInit, OnDestroy {

  delimiter: string = ';';
  stepperIndex: any = 0;
  importForm: any;

  @Input() parsedProductData!: Array<any>;
  @Output() parsedProductDataChange: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();
  @Output() moveToStep: EventEmitter<any> = new EventEmitter();

  constructor(
    private csvParser: NgxCsvParser,
    private toasterService : ToastService
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
    console.log('----- ngOnInit!');
    console.log(this.parsedProductData);
    this.subscription = this.control.valueChanges.subscribe((values: Array<File>) => {
      console.log(values);
      if(values && values.length > 0){
        this.csvParser.parse(values[0], { header: true, delimiter: this.delimiter})
          .pipe().subscribe((result: any) => {
            console.log(result);
            this.parsedProductData = result;
            this.parsedProductDataChange.emit(this.parsedProductData);
          }, (error: NgxCSVParserError) => {
            this.toasterService.show({ type: 'danger', text: 'Upload csv file'});
            this.parsedProductData = [];
            this.parsedProductDataChange.emit(this.parsedProductData);
          });
      } else {
        this.parsedProductData = [];
        this.parsedProductDataChange.emit(this.parsedProductData);
      }  
    });
  }

  public ngOnDestroy(): void {
    console.log('--- ngOnDestroy!!');
    this.subscription.unsubscribe();
  }

  // Function for go to next step
  nextStep(step: string){
    console.log('--- nextStep!!');
    this.moveToStep.emit(step);
  }

  // Function for validate file import
  validateImport() : boolean{
    return this.delimiter.trim() == '' || this.parsedProductData.length == 0;
  }

  console(event : any){
    console.log(event);
    return 'test';
  }
}
