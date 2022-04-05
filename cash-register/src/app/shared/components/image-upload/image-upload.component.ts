import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { ApiService } from '../../service/api.service';
import { DialogComponent } from '../../service/dialog';

import {Subject, Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam'
import { FormGroup, FormControl, Validators} from '@angular/forms';

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
  file: any = '';
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
    private apiService: ApiService
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
    this.file = undefined;
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];      
    }
  }
     
  submit(){
    const formData = new FormData();
    formData.append('file', this.file, 'name');
    this.file = undefined;
    this.apiService.fileUpload('core', '/api/v1/file-uploads/' + this.requestParams.iBusinessId, formData).subscribe(
      (result : any) =>{
      },
      (err: any) =>{
        console.error(err);
      }
    )
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
    this.dialogRef.close.emit(data);
    this.toggleWebcam(false);
    this.cameraWasSwitched(this.deviceId);
    this.nextWebcamObservable;
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
