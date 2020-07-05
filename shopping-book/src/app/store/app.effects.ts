import { AuthEffects } from '../auth/store/auth.effects';
import { RecipeEffects } from '../recipes/store/recipe.effects';

export const appEffects = [
  AuthEffects,
  RecipeEffects
];
