import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener, Input, OnChanges,
  OnInit,
  QueryList,
  Renderer2, SimpleChanges,
  ViewChildren
} from '@angular/core';
import {Subject} from "rxjs";

@Directive({
  selector: '.accordion',
})
export class AccordionDirective implements OnChanges {
  @Input() itemLength: number = 0;
  constructor(private renderer: Renderer2, private elem: ElementRef) { }


  ngOnChanges(changes: SimpleChanges) {
    if(changes.itemLength) {
      if(changes.itemLength.currentValue > changes.itemLength.previousValue) {
        this.closeAllElements(null)
      }
    }
  }

  getChildren(parent: any): any {
    if(parent.children && parent.children.length === 2) {
      if(parent.children[1].className.indexOf('accordion-collapse') >= 0) {
        return parent.children[1]
      }
    }
    return null
  }


  searchElement(target: any): any {
    if(target.parentElement) {
      const parent = target.parentElement
      const child = this.getChildren(parent)
      if (child) {
        return child
      } else {
        return this.searchElement(parent)
      }
    } else {
      return null
    }
  }

  closeAllElements(child: any): void {
    let accordionBodies = this.elem.nativeElement.querySelectorAll('.accordion-collapse')
    accordionBodies.forEach( (e: any) => {
      if(!child || e !== child) {
        if(e.parentElement && e.parentElement.children && e.parentElement.children.length === 2) {
          this.renderer.addClass(e.parentElement.firstChild.firstChild, 'collapsed')
        }
        this.renderer.removeClass(e, 'show')
      }
    })
  }

  @HostListener("click", ['$event.target'])
  onClick(target: any): void {
    if(target.classList.contains('accordion-button')) {
      const child = this.searchElement(target)
      if (child) {
        const isCollapsed = child.classList.contains('show')
        if (isCollapsed) {
          this.renderer.removeClass(child, 'show')
          this.renderer.addClass(target, 'collapsed')
        } else {
          this.renderer.addClass(child, 'show')
          this.renderer.removeClass(target, 'collapsed')
        }

        this.closeAllElements(child)
      }
    }
  }

}
