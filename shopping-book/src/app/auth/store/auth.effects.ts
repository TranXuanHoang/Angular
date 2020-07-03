import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
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
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((action: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        {
          email: action.payload.email,
          password: action.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        map((authRest: AuthResponseData) => this.handleAuthentication(authRest)),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    })
  );

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
        // (which in this case is an AuthActions.AuthenticateSuccess) in an Observable
        map((authRes: AuthResponseData) => this.handleAuthentication(authRes)),
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
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS/*, AuthActions.LOGOUT*/),
    tap((action: AuthActions.AuthActions) => {
      // if (action.type === AuthActions.AUTHENTICATE_SUCCESS) {
      //   this.router.navigate(['/']);
      // } else if (action.type === AuthActions.LOGOUT) {
      //   this.router.navigate(['/auth']);
      // }
      this.router.navigate(['/']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map((action: AuthActions.AutoLogin) => {
      const userData: {
        email: string,
        id: string,
        _token: string,
        _tokenExpirationDate: string
      } = JSON.parse(localStorage.getItem('userData'));

      if (!userData) {
        return { type: 'AUTO_LOGIN_FAIL' };
      }

      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate)
      );

      if (loadedUser.token) {
        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          tokenExpirationDate: new Date(userData._tokenExpirationDate)
        });
      }

      return { type: 'AUTO_LOGIN_FAIL' };
    })
  );

  @Effect({ dispatch: false })
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap((action: AuthActions.Logout) => {
      localStorage.removeItem('userData');
      this.authService.clearLogoutTimer();
      this.router.navigate(['/auth']);
    })
  );

  private handleAuthentication(authRes: AuthResponseData) {
    const tokenExpirationDate = new Date(new Date().getTime() + +authRes.expiresIn * 1000);
    const user = new User(authRes.email, authRes.localId, authRes.idToken, tokenExpirationDate);
    this.authService.setLogoutTimer(+authRes.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({
      email: authRes.email,
      userId: authRes.localId,
      token: authRes.idToken,
      tokenExpirationDate: tokenExpirationDate
    });
  }

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
