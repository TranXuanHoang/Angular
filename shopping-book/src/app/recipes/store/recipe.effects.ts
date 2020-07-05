import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import { Recipe } from '../recipe.model';
import * as RecipeActions from './recipe.actions';

@Injectable()
export class RecipeEffects {
  static readonly BASE_URL = 'https://ng-shopping-book-b4fe5.firebaseio.com/';

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private store: Store<fromApp.AppState>
  ) { }

  @Effect()
  // Fetchs recipes data from Firebase Realtime Database. Here we use RecipeActions.SetRecipes
  // to set all fetched recipes to the local NgRx Store. This allows
  // us to use this fetchRecipes() in other resolvers to make sure that we will
  // fetch the data before any recipes-related pages (routes starting with /recipes)
  // is loaded, so that we can avoid the lack of data when these pages are displayed.
  fetchRecipes = this.actions$.pipe(
    ofType(RecipeActions.FETCH_RECIPES),
    switchMap((action: RecipeActions.FetchRecipes) => {
      return this.http.get<Recipe[]>(`${RecipeEffects.BASE_URL}recipes.json`);
    }),
    map(recipes => {
      return recipes.map(recipe => {
        return { ...recipe, ingredients: recipe.ingredients ? recipe.ingredients : [] };
      });
    }),
    map(recipes => {
      return new RecipeActions.SetRecipes(recipes);
    })
  );

  @Effect({ dispatch: false })
  storeRecipes = this.actions$.pipe(
    ofType(RecipeActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([action, recipesState]) => {
      // The 'withLatestFrom()' operator is used to get the latest recipes data from the store.
      // The the results from 'ofType()' and 'withLatestFrom()' are automatically passed into
      // the 'switchMap()' as 'action' and 'recipesState' arguments. These arguments are defined
      // in a so-called array destructuring - Use square brackets in argument list and store
      // the two elements that the array will have in variables that can then be used inside the
      // 'switchMap()'. If need to access property(ies) of any of these variables, we can cast it
      // to its coressponding data type like belows, and then use '.' dot operator as normal
      // (action as RecipeActions.StoreRecipes)

      // Use put to rewrite entire data in the 'recipes' folder of the Firebase Realtime Database.
      // Normally subscription to the Observable returned by http.put() can be done
      // in .component.ts files when we want to manage the progress and/or status of the
      // http request. But here, since we don't care much about that, we just simply subcribe here
      return this.http.put(`${RecipeEffects.BASE_URL}recipes.json`, recipesState.recipes);
    }),
    tap(response => {
      console.log(response);
    })
  );
}
