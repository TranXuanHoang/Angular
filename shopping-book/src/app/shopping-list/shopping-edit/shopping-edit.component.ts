import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit {
  constructor(private shoppingListService: ShoppingListService) { }

  ngOnInit(): void {
  }

  onAddIngedient(shoppingEditForm: NgForm) {
    if (shoppingEditForm.valid) {
      this.shoppingListService.addIngredient(new Ingredient(
        shoppingEditForm.value.name,
        shoppingEditForm.value.amount
      ));

      shoppingEditForm.reset();
    }
  }
}
