import { Component, OnInit, Input } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Params, Data, Router } from '@angular/router';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private recipeService: RecipeService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Method 1: Get the 'id' from the activated route, and then call
    // RecipeService's getRecipes to get a recipes list,
    // than use the 'id' and that list to find out the selected recipe
    // this.recipe = this.recipeService.getRecipes()[+this.route.snapshot.params['id']];
    // this.route.params.subscribe(
    //   (params: Params) => {
    //     this.recipe = this.recipeService.getRecipes()[+params['id']];
    //   }
    // );

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
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  onEditRecipe() {
    // Navigate to (relative) /recipes/:id/edit
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onDeleteRecipe() {
    this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['/recipes']);
  }
}
