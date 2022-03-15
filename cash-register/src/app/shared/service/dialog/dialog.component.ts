import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  Injector,
  Compiler,
  NgModuleRef,
} from '@angular/core';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private compiler: Compiler,
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver) {}
  @Output() close = new EventEmitter();
  @Input() template: any;
  @Input() context: any;
  @Input() cssClass: any;

  @ViewChild('dialogContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  componentRef : any;
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    import('../../shared.module').then(({ SharedModule }) => {
      this.compiler.compileModuleAsync(SharedModule).then(moduleFactory => {
        const moduleRef: any = moduleFactory.create(this.injector);
        const componentFactory = moduleRef.instance.resolveComponent(this.template);
        this.componentRef = this.container.createComponent(componentFactory, undefined, moduleRef.injector);
        if(this.context && Object.keys(this.context).length > 0 ){
          Object.keys(this.context).forEach(key => {
            this.componentRef.instance[key] = this.context[key];
          });
        }
      })
    })
  }

  ngOnDestroy(): void {
  }
}
