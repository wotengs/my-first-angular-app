import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';

export interface AuthState {
  accessToken?: string | null;
  refreshToken?: string | null;
}

export const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginSuccess, (state, { accessToken, refreshToken }) => ({
    ...state,
    accessToken,
    refreshToken,
  })),
  on(AuthActions.logout, () => initialAuthState)
);
