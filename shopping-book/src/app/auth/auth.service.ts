import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  static API_KEY = 'AIzaSyBvFMwO18n4FMbmPxSF8GudSB3hkOMNhac';

  // The BehaviorSubject is similar to the Subject object, but it
  // allows its subcribers to get the values emitted before the subscription.
  // Later on, we will subscribe to this 'user BehaviorSubject' and get the
  // previously emitted (by the next() method) user model object by calling
  // take(1) RxJS operator.
  user = new BehaviorSubject<User>(null);

  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) { }

  // See
  // https://firebase.google.com/docs/reference/rest/auth#section-create-email-password
  // for more information about how to sign up with email and password using Firebase
  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${AuthService.API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(
      catchError(errorRes => this.handleError(errorRes)),
      tap(authRes => this.handleAuthentication(authRes))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${AuthService.API_KEY}`,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(
      catchError(errorRes => this.handleError(errorRes)),
      tap(authRes => this.handleAuthentication(authRes))
    );
  }

  autoLogin() {
    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  /**
   * Automatically logout an authenticated user.
   * @param expirationDuration miliseconds until the current authenticated token expires
   */
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(authRes: AuthResponseData) {
    const tokenExpirationDate = new Date(new Date().getTime() + +authRes.expiresIn * 1000);
    const user = new User(authRes.email, authRes.localId, authRes.idToken, tokenExpirationDate);
    this.user.next(user);
    this.autoLogout(+authRes.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    console.log(errorRes);
    let errorMsg = 'An unknown error occurred!';

    // The following check is for the case of network error
    // causing us to not able to receive even the error response
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMsg)
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
    return throwError(errorMsg);
  }
}
