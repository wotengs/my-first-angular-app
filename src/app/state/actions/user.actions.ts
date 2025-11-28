import { createAction, props } from '@ngrx/store';
import { User } from '../../model/user.model';

export const loadUser = createAction('[User] Load');
export const loadUserSuccess = createAction('[User] Load Success', props<{ user: User }>());
export const loadUserFailure = createAction('[User] Load Failure', props<{ error: any }>());
