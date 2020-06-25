import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface AuthResponseData {
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
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  static API_KEY = 'AIzaSyBvFMwO18n4FMbmPxSF8GudSB3hkOMNhac';

  constructor(private http: HttpClient) { }

  // See
  // https://firebase.google.com/docs/reference/rest/auth#section-create-email-password
  // for more information about how to sign up with email and password using Firebase
  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${AuthService.API_KEY}`, {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(
      catchError(errorRes => {
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
        }
        return throwError(errorMsg);
      })
    );
  }
}
