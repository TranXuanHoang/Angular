import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import * as AuthActions from './auth.actions';

export interface AuthResponseData {
  /** A Firebase Auth ID token for the newly created user. */
  idToken: string,

  /** The email for the newly created user. */
  email: string;

  /** A Firebase Auth refresh token for the newly created user. */
  refreshToken: string;

  /** The number of seconds in which the ID token expires. */
  expiresIn: string;

  /** The uid of the newly created user. */
  localId: string;

  /** Whether the email is for an existing account. */
  registered: boolean;
}

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions, private http: HttpClient, private router: Router) { }

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((action: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        {
          email: action.payload.email,
          password: action.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        // The 'map' operator automatically wraps what returned by the 'return' statement
        // (which in this case is an AuthActions.Login) in an Observable
        map((resData: AuthResponseData) => {
          const tokenExpirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
          return new AuthActions.Authenticate({
            email: resData.email,
            userId: resData.localId,
            token: resData.idToken,
            tokenExpirationDate: tokenExpirationDate
          });
        }),
        catchError((error: HttpErrorResponse) => {
          // Even if the http request failed, we must handle the error and return
          // an Observable of Action, e.g. AuthActions.LoginFail
          // so that the 'this.actions$' observable will not stop listening to future events
          // (because, observables will terminate whenever error occurred without handling)
          // The 'this.handleError()' method will return an Observable<AuthActions.LoginFail>
          // (using the 'of()' RxJs function to wrap up the AuthActions.LoginFail in an Observable)
          return this.handleError(error);
        }),
      );
    })
  );

  @Effect({ dispatch: false })
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE),
    tap((action: AuthActions.AuthActions) => {
      this.router.navigate(['/'])
    })
  );

  private handleError(errorRes: HttpErrorResponse) {
    console.log(errorRes);
    let errorMsg = 'An unknown error occurred!';

    // The following check is for the case of network error
    // causing us to not able to receive even the error response
    if (!errorRes.error || !errorRes.error.error) {
      return of(new AuthActions.AuthenticateFail(errorMsg));
    }

    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMsg = 'Email exists already.';
        break;
      case 'INVALID_EMAIL':
        errorMsg = 'Email is invalid.';
        break
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMsg = 'Too many attempts. Try later.';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMsg = 'The email is not found'; // for security, shouldn't clearly specify error message like this
        break;
      case 'INVALID_PASSWORD':
        errorMsg = 'The password is in correct'; // for security, shouldn't clearly specify error message like this
        break;
    }
    return of(new AuthActions.AuthenticateFail(errorMsg));
  }
}
