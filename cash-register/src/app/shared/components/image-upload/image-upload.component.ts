import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';

import {Subject, Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam'
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.sass']
})
export class ImageUploadComponent implements OnInit {

  faTimes = faTimes;
  dialogRef: DialogComponent;
  public showWebcam = false;
  public showUpload = false;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  deviceId: any = '';
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
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private apiService: ApiService,
    private http: HttpClient
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
  }

  get f(){
    return this.myForm.controls;
  }
     
  onFileChange(event:any) {
    console.log('On change : ', event.target.files);
    this.file = undefined;
    if (event.target.files.length > 0) {
      console.log('-- inside here!');
      this.file = event.target.files[0];      
    }
  }

  randomString(length: number) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
     
  submit(){
    console.log(' we are here!!');

    let name = this.randomString(20);

    // if(this.showWebcam && !this.showUpload){ 
    //   console.log(' Upload camera image!'); 
    //   console.log(this.webcamImage._imageAsDataUrl);
    //   var content = this.webcamImage._imageAsDataUrl;
    //   var blob = new Blob([content], { type: "text/xml" });
    //   this.file = blob;
    // }
    // if(!this.showWebcam && this.showUpload){ console.log(' Upload selected image!'); }

    

    console.log(this.file);
    // console.log(new Buffer(this.file));
    // const formData = new FormData();
    // formData.append('file', this.file, name);
    // this.file = undefined;
    this.apiService.getNew('core', '/api/v1/file-uploads/' + this.requestParams.iBusinessId + '?fileName=' + this.file.name + '&fileType=' + this.file.type,).subscribe(
      async(result : any) =>{
        console.log(result)
        const data = await this.uploadFileToS3(result.data.signature, this.file, result.data.url, this.file.type);
        console.log(data);
      },
      (err: any) =>{
        console.error(err);
      }
    )
    // this.apiService.fileUpload('core', '/api/v1/file-uploads/' + this.requestParams.iBusinessId, formData).subscribe(
    //   (result : any) =>{
    //   },
    //   (err: any) =>{
    //     console.error(err);
    //   }
    // )
  }

  uploadFileToS3(signedRequest: any, file: any, url: any, type: any) {
    const imageConfig = {
      headers: {
        'x-amz-acl': 'public-read',
        'Content-Encoding': 'base64',
        'Content-Type': type,
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Allow-Origin': '*'
      },
    };
    const fileConfig = {
      headers: {
        'x-amz-acl': 'public-read',
        'Content-Type': type,
        charset: 'utf-8',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Allow-Origin': '*'
      },
    };

    console.log(signedRequest, file)

    
    let finalHeaders = { 
        'x-amz-acl': 'public-read',
        'Content-Type': type,
        charset: 'utf-8',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Allow-Origin': '*',
         observe: 'response' };
         
    let httpHeaders = {
      headers: new HttpHeaders(finalHeaders),
    }

    return this.http.put(
          signedRequest,
          file,
          httpHeaders,
          ).subscribe(
            (result : any) =>{
              console.log(result)
            },
            (err: any) =>{
              console.error(err);
            }
          )
        // .then((response: any) => {
        //   console.log(response)
        //   // fulfill(url);
        // })
        // .catch((error: any) => {
        //   console.error(error)
        //   // reject(error);
        // });
    // }
    // return new Promise((fulfill, reject) => {
    //   axios
    //     .put(
    //       signedRequest,
    //       file.buffer,
    //       type === 'image' ? imageConfig : fileConfig,
    //     )
    //     .then((response) => {
    //       fulfill(url);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });
  }

  useCamera(){
    if(!this.showWebcam && this.showUpload) this.showUpload = false;
    this.showWebcam = !this.showWebcam;
  }

  useUpload(){
    if(this.showWebcam && !this.showUpload) this.showWebcam = false;
    this.showUpload = !this.showUpload;
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

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
}
