import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('shoppingEditForm') shoppingEditForm: NgForm;
  subscription: Subscription;
  editingMode = false;
  editedItemIndex: number;
  editedItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService) { }

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing.subscribe(
      (index: number) => {
        this.editedItemIndex = index;
        this.editingMode = true;
        this.editedItem = this.shoppingListService.getIngredient(index);
        this.shoppingEditForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
      }
    );
  }

  onAddIngedient(shoppingEditForm: NgForm) {
    if (shoppingEditForm.valid) {
      let newIngredient = new Ingredient(
        shoppingEditForm.value.name,
        shoppingEditForm.value.amount
      );

      if (this.editingMode) {
        // Save edited item
        this.shoppingListService.updateIngredient(this.editedItemIndex, newIngredient);
        this.editingMode = false;
      } else {
        // Add new item
        this.shoppingListService.addIngredient(newIngredient);
      }

      shoppingEditForm.reset();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
