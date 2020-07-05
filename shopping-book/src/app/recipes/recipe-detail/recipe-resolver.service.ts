import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import { Recipe } from '../recipe.model';

@Injectable()
export class RecipeResolver implements Resolve<Recipe> {
  constructor(private store: Store<fromApp.AppState>) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Recipe | Observable<Recipe> | Promise<Recipe> {
    return this.store.select('recipes')
      .pipe(
        map(recipesState => recipesState.recipes[+route.params['id']]),
        take(1) // use take(1) to get only one element emitted and the observable closed.
      );
  }
}
