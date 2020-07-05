import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Store } from '@ngrx/store';
import { exhaustMap, map, take } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private store: Store<fromApp.AppState>) { }

  // Adds an auth token to each out-going http requests.
  // For more information about how to authenticate REST requests with Firebase, see
  // https://firebase.google.com/docs/database/rest/auth
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('auth').pipe(
      take(1),
      map(authState => authState.user),
      exhaustMap(user => {
        if (!user) {
          return next.handle(req);
        }
        const modifiedReq = req.clone({ params: new HttpParams().set('auth', user.token) });
        return next.handle(modifiedReq);
      }),
    );
  }
}
