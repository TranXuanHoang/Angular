import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { RecipeService } from './recipes/recipe.service';

/** Provides all app-wide services. Normally, we should use
 * ```
 *    @Injectable({providedIn: 'root'})
 * ```
 * if possible as it is a recommended way of providing services (that will allow Angular to
 * optimize the source code). But in case, we do need to provide any services inside the AppModule's
 * ```
 *    @Ngmodule({providers: [...]})
 * ```
 * we can split that providing into this core.module.ts file, so that we can keep the AppModule leaner.
 */
@NgModule({
  providers: [
    RecipeService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
  ]
})
export class CoreModule { }
