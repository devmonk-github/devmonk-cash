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
  public showWebcam = true;
  public showUpload = false;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  deviceId: any = '';
  isImageValid:Boolean = false;
  requestParams: any = {
    iBusinessId: ''
  }
  myForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    file: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', [Validators.required])
  });
  file: any = undefined;
  defaultHeaders: any = { 'Content-Type': 'application/json', observe: 'response' };
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: any = undefined;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
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
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
    this.openImageDialog();
  }

  openImageDialog() {
   // this.container.clear();
    try {
      import('imageUpload/ImageUploadModule').then(({ ImageUploadModule }) => {
        this.compiler.compileModuleAsync(ImageUploadModule).then(moduleFactory => {
          const moduleRef: NgModuleRef<typeof ImageUploadModule> = moduleFactory.create(this.injector);
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
        console.warn('error in importing supplier product slider module');
      });
    } catch (error) {
      console.log('error while initializing slider', error);
    }
  }

  get f() {
    return this.myForm.controls;
  }

  sanitizeImageUrl(imageUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }


  onFileChange(event: any) {
    this.file = undefined;
    this.isImageValid = false;
    if (event.target.files.length > 0) {
      if(event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg'){
        if(event.target.files[0].size > 102400 && event.target.files[0].size <= 2097152){
          this.isImageValid = false;
          this.file = event.target.files[0];
          this.webcamImage = URL.createObjectURL(event.target.files[0]);
        }else{
          this.isImageValid = true;
          this.toastService.show({ type: 'warning', text: 'Image size must be 100 kb to 2 mb' });
        }
      }else{
        this.isImageValid= true;
        this.toastService.show({ type: 'warning', text: "Image extension must be png , jpeg , jpg" })
      }
    
    }
  }

  randomString(fileName: string, length: number) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    fileName = fileName ? fileName.replace(/\s/g, '_') : '';
    return `${fileName}_${result}`;
  }

  submit() {
    if (this.showWebcam) {
      var content = this.webcamImage;
      const arr = this.webcamImage.imageAsDataUrl.split(",");
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      this.file = new File([u8arr], this.randomString('Webcam_Capture', 4), { type: content._mimeType })
    }
    this.file = new File([this.file], this.randomString(this.file.name, 4), { type: this.file.type });
    if (!this.showWebcam && this.showUpload) { console.log(' Upload selected image!'); }
    this.apiService.getNew('core', '/api/v1/file-uploads/' + this.requestParams.iBusinessId + '?fileName=' + this.file.name + '&fileType=' + this.file.type,).subscribe(
      async (result: any) => {
        await this.uploadFileToS3(result.data.signature, this.file, result.data.url, this.file.type);
      },
      (err: any) => {
        console.error(err);
        this.file = undefined;
      }
    )
  }

  uploadFileToS3(signedRequest: any, file: any, url: any, type: any) {
    let finalHeaders = {
      'x-amz-acl': 'public-read',
      'Content-Type': type,
      charset: 'utf-8',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Allow-Origin': '*',
      observe: 'response'
    };

    let httpHeaders = {
      headers: new HttpHeaders(finalHeaders),
    }

    this.http.put(
      signedRequest,
      file,
      httpHeaders,
    ).subscribe(
      (result: any) => {
        this.file = undefined;
        this.close({ url });
      },
      (err: any) => {
        this.file = undefined;
      }
    )
  }

  useCamera() {
    // if (!this.showWebcam && this.showUpload) this.showUpload = false;
    // this.showWebcam = !this.showWebcam;
    this.showUpload = false;
    this.showWebcam = true;
  }

  useUpload() {
    // if (this.showWebcam && !this.showUpload) this.showWebcam = false;
    this.showWebcam = false;
    this.showUpload = true;
  }
 

  close(data: any) {
    this.toggleWebcam(false);
    setTimeout(() => {
      this.dialogRef.close.emit(data);
    }, 100);
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(showWebcam: boolean): void {
    this.showWebcam = showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
}
