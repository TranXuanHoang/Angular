import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipeResolver } from './recipe-detail/recipe-resolver.service';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';
import { RecipesResolverService } from './recipes-resolver.service';
import { RecipesComponent } from './recipes.component';

const routes: Routes = [
  {
    path: '',
    component: RecipesComponent,
    // The canActivate: [...] here will check whether the user is authenticated (logged in).
    // If yes, then it will allow navigating to /recipes. Otherwise, it will direct to /auth.
    canActivate: [AuthGuard],
    // The resolver: [...] here will let the /recipes route wait until the 'RecipesResolverService'
    // finish fetching data from Firebase Realtime Database and set the data into the NgRx Store.
    // This is important, so that the app get recipes data populated before users navigate to sub-routes.
    // This setup here also means that whenever users navigate to routers other than
    // /recipes[|/new|/:id|/:id/edit], and then navigate back to /recipes[|/new|/:id|/:id/edit]
    // the RecipesResolverService will get its 'resolve' method run again
    resolve: [RecipesResolverService],
    children: [
      { path: 'new', component: RecipeEditComponent },
      { path: ':id', component: RecipeDetailComponent, resolve: { recipe: RecipeResolver } },
      { path: ':id/edit', component: RecipeEditComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipesRoutingModule { }
