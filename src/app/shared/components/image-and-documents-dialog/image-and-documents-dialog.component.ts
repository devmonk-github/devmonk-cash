import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef,Compiler, Injector, NgModuleRef } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';

import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastService } from '../toast';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-image-and-documents-dialog',
  templateUrl: './image-and-documents-dialog.component.html',
  styleUrls: ['./image-and-documents-dialog.component.sass']
})
export class ImageAndDocumentsDialogComponent implements OnInit {
  faTimes = faTimes;
  dialogRef: DialogComponent;
 
  requestParams: any = {
    iBusinessId: ''
  }
  
  imageData:any;
  @ViewChild('image', { read: ViewContainerRef }) container!: ViewContainerRef;
  componentRef: any;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastService:ToastService,
    private compiler: Compiler,
    private injector: Injector
  ) {
    const _injector = this.viewContainerRef.parentInjector;
    this.dialogRef = _injector.get<DialogComponent>(DialogComponent);
  }

  ngOnInit(): void {
    this.requestParams.iBusinessId = localStorage.getItem("currentBusiness");
    this.openCustomersDocsImagesUploadDialog();
  }

  openCustomersDocsImagesUploadDialog() {
   // this.container.clear();
    try {
      import('customersDocsImagesUpload/CustomersDocsImagesUploadModule').then(({ CustomersDocsImagesUploadModule }) => {
        this.compiler.compileModuleAsync(CustomersDocsImagesUploadModule).then(moduleFactory => {
          const moduleRef: NgModuleRef<typeof CustomersDocsImagesUploadModule> = moduleFactory.create(this.injector);
          const componentFactory = moduleRef.instance.resolveComponent();
          this.componentRef = this.container.createComponent(componentFactory, undefined, moduleRef.injector);
          this.componentRef.instance.$data = this.imageData;
          this.componentRef.instance.oDocsDetail = this.imageData;
          this.componentRef.instance.triggerEvent.subscribe((event: any) => {
            if(event){
              this.close({ event });
            }
          })
        });
      }).catch(e => {
        console.warn('error in importing image uplaod module');
      });
    } catch (error) {
      console.log('error while initializing image uplaod module', error);
    }
  }

  close(data: any) {
    setTimeout(() => {
      this.dialogRef.close.emit(data);
    }, 100);
  }
  
}
