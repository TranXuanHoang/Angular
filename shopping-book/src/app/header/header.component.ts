import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  collapsed: boolean = true;
  show: boolean = false;
  feature = 'recipe';

  @Output() featureSelected = new EventEmitter<string>();

  ngOnInit(): void {
  }

  toggleDropdownMenu() {
    this.show = !this.show;
  }

  onFeatureSelected(feature: string) {
    this.feature = feature;
    this.featureSelected.emit(feature);
  }
}
