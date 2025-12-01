import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user.actions';

export interface UserState {
  user?: any | null;
}

export const initialUserState: UserState = { user: null };

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loadUserSuccess, (state, { user }) => ({ ...state, user })),
  on(UserActions.loadUserFailure, (state) => ({ ...state, user: null }))
);
