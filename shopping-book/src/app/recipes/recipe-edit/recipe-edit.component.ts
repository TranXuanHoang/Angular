import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Ingredient } from '../../shared/ingredient.model';
import * as fromApp from '../../store/app.reducer';
import { Recipe } from '../recipe.model';
import * as RecipeActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  recipeForm: FormGroup;
  id: number;
  editMode: boolean = false;
  recipe: Recipe;

  private storeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit(): void {
    this.storeSub = this.route.params.pipe(
      switchMap((params: Params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
        if (this.editMode) {
          return this.store.select('recipes').pipe(
            map(recipesState => recipesState.recipes[this.id])
          );
        } else {
          return of(new Recipe('', '', '', []));
        }
      }),
    ).subscribe(recipe => {
      this.recipe = recipe;
      this.initForm();
    });
  }

  private initForm() {
    this.recipeForm = new FormGroup({
      name: new FormControl(this.recipe.name, Validators.required),
      description: new FormControl(this.recipe.description, Validators.required),
      imagePath: new FormControl(this.recipe.imagePath, Validators.required),
      ingredients: new FormArray(
        this.recipe.ingredients.map(
          (ingredient: Ingredient, index: number) => {
            return new FormGroup({
              'name': new FormControl(ingredient.name, Validators.required),
              'amount': new FormControl(ingredient.amount, [
                Validators.required,
                Validators.pattern(/^[1-9]+[0-9]*$/)
              ])
            });
          })
      )
    });
  }

  get ingredientsControls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(new FormGroup({
      'name': new FormControl(null, Validators.required),
      'amount': new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[1-9]+[0-9]*$/)
      ])
    }));
  }

  onDeleteIngredient(index: number) {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  onSubmit() {
    // We can define a newRecipe object like belows and pass it
    // to the RecipeActions.UpdateRecipe() and/or RecipeActions.AddRecipe().
    // But we can also directly pass the recipeForm.value object
    // as this object structure is the same as any Recipe objects
    // (same fields' names and nested structure).
    // const newRecipe = new Recipe(
    //   this.recipeForm.value.name,
    //   this.recipeForm.value.description,
    //   this.recipeForm.value.imagePath,
    //   this.recipeForm.value.ingredients
    // );
    if (this.editMode) {
      this.store.dispatch(
        new RecipeActions.UpdateRecipe({ index: this.id, recipe: this.recipeForm.value })
      );
    } else {
      this.store.dispatch(new RecipeActions.AddRecipe(this.recipeForm.value));
    }
    this.onCancel();
  }

  onCancel() {
    this.recipeForm.reset();
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
