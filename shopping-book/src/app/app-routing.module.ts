import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecipesComponent } from './recipes/recipes.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeResolver } from './recipes/recipe-detail/recipe-resolver.service';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { RecipesResolverService } from './recipes/recipes-resolver.service';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
  {
    // The resolver: [...] here will let the /recipes route wait until the 'RecipesResolverService'
    // finish fetching data from Firebase Realtime Database and set the data into the 'RecipeService'.
    // This is important, so that the app get recipes data populated before users navigate to sub-routes.
    // This setup here also means that whenever users navigate to routers other than
    // /recipes[|/new|/:id|/:id/edit], and then navigate back to /recipes[|/new|/:id|/:id/edit]
    // the RecipesResolverService will get its 'resolve' method run again
    path: 'recipes', component: RecipesComponent, resolve: [RecipesResolverService], children: [
      { path: 'new', component: RecipeEditComponent },
      { path: ':id', component: RecipeDetailComponent, resolve: { recipe: RecipeResolver } },
      { path: ':id/edit', component: RecipeEditComponent },
    ]
  },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: 'recipes', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
