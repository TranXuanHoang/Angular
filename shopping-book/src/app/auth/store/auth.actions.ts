import { Action } from '@ngrx/store';

export const LOGIN_START = '[Auth] Login Start';
export const AUTHENTICATE = '[Auth] Authenticate';
export const AUTHENTICATE_FAIL = '[Auth] Authenticate Fail';
export const LOGOUT = '[Auth] Logout';

export class LoginStart implements Action {
  readonly type = LOGIN_START;

  constructor(public payload: { email: string, password: string }) { }
}

export class Authenticate implements Action {
  readonly type = AUTHENTICATE;

  constructor(public payload: {
    email: string,
    userId: string,
    token: string,
    tokenExpirationDate: Date
  }) { }
}

export class AuthenticateFail implements Action {
  readonly type = AUTHENTICATE_FAIL;

  constructor(public payload: string) { }
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export type AuthActions = LoginStart | Authenticate | AuthenticateFail | Logout;
