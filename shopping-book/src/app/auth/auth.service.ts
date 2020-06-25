import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

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
    });
  }
}
