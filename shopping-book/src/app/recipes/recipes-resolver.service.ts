import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import { Recipe } from './recipe.model';
import * as RecipeActions from './store/recipe.actions';

/**
 * This resolver is to make sure that when
 * /recipes/:id
 * /recipes/:id/edit
 * are loaded, the recipes data will be fetched beforehand
 */
@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private action$: Actions,
    private store: Store<fromApp.AppState>
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Recipe[]> | Promise<Recipe[]> | Recipe[] {
    // Method 1: Only fetch recipes data if store doesn't contain it
    return this.store.select('recipes')
      .pipe(
        take(1),
        map(recipesState => recipesState.recipes),
        switchMap((recipes: Recipe[]) => {
          if (recipes.length === 0) {
            // No recipes data in store, fetch them from remote DB
            this.store.dispatch(new RecipeActions.FetchRecipes())
            return this.action$.pipe(
              ofType(RecipeActions.SET_RECIPES),
              map((recipes: Recipe[]) => recipes), // No need to add this line, just to crealy specify type as Recipe[]
              take(1),
            );
          } else {
            // Already have recipes data in store, just return back as an observable
            return of(recipes);
          }
        }),
      );

    // Method 2: Always fetch recipes from remote database
    // this.store.dispatch(new RecipeActions.FetchRecipes());
    // return this.action$.pipe(
    //   ofType(RecipeActions.SET_RECIPES),
    //   take(1) // take only one value, then complete and unsubscribe from the subscription
    // );
  }
}
