import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from "@angular/core";

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective implements OnInit {
  @Input('appDropdown') shouldOpen: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    if (this.shouldOpen) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    this.renderer.addClass(this.el.nativeElement, 'show');
    this.renderer.addClass(this.el.nativeElement.children[1], 'show');
  }

  hide() {
    this.renderer.removeClass(this.el.nativeElement, 'show');
    this.renderer.removeClass(this.el.nativeElement.children[1], 'show');
  }

  toggle() {
    this.shouldOpen = !this.shouldOpen;
    if (this.shouldOpen) {
      this.show();
    } else {
      this.hide();
    }
  }

  // Only close dropdown when click on it again
  // @HostListener('click') mouseClick() {
  //   this.toggle();
  // }

  // Sets dropdown so that it can also be closed by a click anywhere outside
  // (which also means that a click on one dropdown closes any other one, btw.)
  @HostListener('document:click', ['$event']) documentClick(event: Event) {
    if (this.el.nativeElement.contains(event.target)) {
      // Toggle
      this.toggle();
    } else {
      this.shouldOpen = false;
      this.hide();
    }
  }
}



// Bootstrap 3
// import {Directive, ElementRef, HostBinding, HostListener} from '@angular/core';

// @Directive({
//   selector: '[appDropdown]'
// })
// export class DropdownDirective {
//   @HostBinding('class.open') isOpen = false;
//   @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
//     this.isOpen = this.elRef.nativeElement.contains(event.target) ? !this.isOpen : false;
//   }
//   constructor(private elRef: ElementRef) {}
// }
