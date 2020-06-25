import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-sprinner',
  template: `
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  `,
  styleUrls: ['./loading-sprinner.component.css']
})
export class LoadingSprinnerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
