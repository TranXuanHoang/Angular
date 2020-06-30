import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Ingredient } from 'src/app/shared/ingredient.model';
import * as ShoppingListActions from '../store/shopping-list.actions';
import * as fromShoppingList from '../store/shopping-list.reducer';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('shoppingEditForm') shoppingEditForm: NgForm;
  subscription: Subscription;
  editingMode = false;
  editedItem: Ingredient;

  constructor(private store: Store<fromShoppingList.AppState>) { }

  ngOnInit(): void {
    this.subscription = this.store.select('shoppingList').subscribe(stateData => {
      if (stateData.editedIngredientIndex === -1) {
        // No ingredient was selected for editing
        this.editingMode = false;
        this.editedItem = null;
      } else {
        // Edit mode
        this.editingMode = true;
        this.editedItem = stateData.editedIngredient;
        this.shoppingEditForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
      }
    });
  }

  onSubmitIngedient(shoppingEditForm: NgForm) {
    if (shoppingEditForm.valid) {
      let newIngredient = new Ingredient(
        shoppingEditForm.value.name,
        shoppingEditForm.value.amount
      );

      if (this.editingMode) {
        // Save edited item
        this.store.dispatch(new ShoppingListActions.UpdateIngredient(newIngredient));
        this.editingMode = false;
      } else {
        // Add new item
        this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient));
      }

      shoppingEditForm.reset();
    }
  }

  onDelete() {
    this.store.dispatch(new ShoppingListActions.DeleteIngredient());
    this.onClear();
  }

  onClear() {
    this.shoppingEditForm.reset();
    this.editingMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }
}
