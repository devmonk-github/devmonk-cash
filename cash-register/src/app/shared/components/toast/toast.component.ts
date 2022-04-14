import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimationEvent } from '@angular/animations';

import { ToastData, ToastConfig, defaultToastConfig } from './toast-config';
import { ToastRef } from './toast-ref';
import { toastAnimations, ToastAnimationState } from './toast-animation';
import { faBolt, faCheckSquare, faEnvelopeSquare, faExclamationTriangle, faQuestion, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  animations: [toastAnimations.fadeToast],
})
export class ToastComponent implements OnInit, OnDestroy {
  animationState: ToastAnimationState = 'default';
  iconType: IconDefinition;
  bg_color: string;
  toastConfig: ToastConfig = defaultToastConfig;

  private intervalId: any;

  constructor(
    readonly data: ToastData,
    readonly ref: ToastRef
    ) {
      switch(data.type){
        case 'primary':
          this.iconType = faEnvelopeSquare;
          break;
        case 'success':
          this.iconType = faCheckSquare;
          break;
        case 'info':
          this.iconType = faQuestion;
          break;
        case 'warning':
          this.iconType = faExclamationTriangle;
          break;
        case 'danger':
          this.iconType = faBolt;
          break;
        default:
          this.iconType = faEnvelopeSquare;
      }
      this.bg_color = data.type ? "bg-" + data.type : "";
  }

  ngOnInit() {
    this.intervalId = setTimeout(() => this.animationState = 'closing', 5000);
  }

  ngOnDestroy() {
    clearTimeout(this.intervalId);
  }

  close() {
    this.ref.close();
  }

  onFadeFinished(event: AnimationEvent) {
    const { toState } = event;
    const isFadeOut = (toState as ToastAnimationState) === 'closing';
    const itFinished = this.animationState === 'closing';

    if (isFadeOut && itFinished) {
      this.close();
    }
  }
}
