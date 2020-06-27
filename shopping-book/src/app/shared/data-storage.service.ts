import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  static readonly BASE_URL = 'https://ng-shopping-book-b4fe5.firebaseio.com/';

  constructor(private http: HttpClient, private recipeService: RecipeService) { }

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();

    // Use put to rewrite entire data in the 'recipes' folder of the Firebase Realtime Database.
    // Normally subscription to the Observable returned by http.put() can be done
    // in .component.ts files when we want to manage the progress and/or status of the
    // http request. But here, since we don't care much about that, we just simply subcribe here
    this.http.put(`${DataStorageService.BASE_URL}recipes.json`, recipes).subscribe(
      response => {
        console.log(response);
      }
    );
  }

  // Fetchs recipes data from Firebase Realtime Database, but only when it is
  // subscribed. Here we use 'tap' rxjs operator to set all fetched recipes
  // to the local recipes array managed by the RecipeService, and subcribe to
  // the observable returned by http.get() in the .component.ts files. This allows
  // us to use this fetchRecipes() in other resolvers to make sure that we will
  // fetch the data before any recipes-related pages (routes starting with /recipes)
  // is loaded, so that we can avoid the lack of data when these pages are displayed
  fetchRecipes() {
    return this.http.get<Recipe[]>(`${DataStorageService.BASE_URL}recipes.json`)
      .pipe(
        map(recipes => {
          return recipes.map(recipe => {
            return { ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] };
          });
        }),
        tap(recipes => {
          this.recipeService.setRecipes(recipes);
        })
      );
  }
}
