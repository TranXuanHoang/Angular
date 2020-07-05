import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';
import { Recipe } from '../recipe.model';
import * as RecipeActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    // Method 1: Get the 'id' from the activated route, and then call
    // Store.select('recipes') to get a recipes list,
    // than use the 'id' and that list to find out the selected recipe.
    // Note that, we will need to inject the NgRx store like below
    //     import * as fromApp from '../../store/app.reducer';
    //     constructor(..., private store: Store<fromApp.AppState>) {}
    // this.route.params.pipe(
    //   map((params: Params) => +params['id']),
    //   switchMap(id => {
    //     this.id = id;
    //     return this.store.select('recipes');
    //   }),
    //   map(recipesState => recipesState.recipes)
    // ).subscribe(recipes => {
    //   this.recipe = recipes[this.id];
    // });

    // Method 2: Use resolve
    // Need to define route as follows:
    // {
    //   path: ':id',
    //   component: RecipeDetailComponent,
    //   resolve: { recipe: RecipeResolver }
    // }
    this.route.data.subscribe(
      (data: Data) => {
        this.recipe = data['recipe'];
      }
    );
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
      }
    );
  }

  addIngredientsToShoppingList() {
    this.store.dispatch(new ShoppingListActions.AddIngredients(this.recipe.ingredients));
  }

  onEditRecipe() {
    // Navigate to (relative) /recipes/:id/edit
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onDeleteRecipe() {
    this.store.dispatch(new RecipeActions.DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }
}
