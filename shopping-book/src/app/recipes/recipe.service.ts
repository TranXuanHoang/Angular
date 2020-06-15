import { Recipe } from './recipe.model';

export class RecipeService {
  private recipes: Recipe[] = [
    new Recipe('Test Recipe',
      'This is a test recipe',
      'https://www.bbcgoodfood.com/sites/default/files/recipe-collections/collection-image/2013/05/chorizo-mozarella-gnocchi-bake-cropped.jpg'
    ),
    new Recipe('Wheat Pizza',
      'The Easiest Whole Wheat Pizza Dough.',
      'https://cookieandkate.com/images/2018/08/whole-wheat-pizza-dough-1-1-768x1152.jpg'
    ),
  ];

  getRecipes() {
    return this.recipes.slice();
  }
}
