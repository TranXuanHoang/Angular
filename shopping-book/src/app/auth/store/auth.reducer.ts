import { User } from '../user.model';
import * as authActions from './auth.actions';

export interface State {
  user: User,
  authError: string,
  loading: boolean
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false
}

export function authReducer(
  state: State = initialState,
  action: authActions.AuthActions
) {
  switch (action.type) {
    case authActions.SIGNUP_START:
    case authActions.LOGIN_START:
      return {
        ...state,
        authError: null,
        loading: true,
        user: null
      };
    case authActions.AUTHENTICATE_SUCCESS:
      const user = new User(
        action.payload.email,
        action.payload.userId,
        action.payload.token,
        action.payload.tokenExpirationDate
      );
      return {
        ...state,
        user: user,
        authError: null,
        loading: false
      };
    case authActions.AUTHENTICATE_FAIL:
      return {
        ...state,
        user: null,
        authError: action.payload,
        loading: false
      };
    case authActions.LOGOUT:
      return {
        ...state,
        user: null
      }
    default:
      return state;
  }
}
