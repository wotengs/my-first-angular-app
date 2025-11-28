import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  Observable,
  throwError,
  switchMap,
  catchError,
  of,
  BehaviorSubject,
  filter,
  take,
  tap,
} from 'rxjs';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    let authReq = req;
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((err: any) => {
        if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
          return throwError(() => err);
        }

        // 401 handling: attempt refresh, with queuing for concurrent requests
        if (!this.refreshInProgress) {
          this.refreshInProgress = true;
          // reset subject
          this.refreshSubject.next(null);

          return this.auth.refreshToken().pipe(
            tap((res) => {
              // notify waiting requests with the new token
              const newToken = this.auth.getAccessToken();
              this.refreshSubject.next(newToken);
            }),
            switchMap(() => {
              this.refreshInProgress = false;
              const newToken = this.auth.getAccessToken();
              if (newToken) {
                const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                return next.handle(retryReq);
              }
              this.auth.logout();
              this.router.navigate(['/login']);
              return throwError(() => err);
            }),
            catchError((refreshErr) => {
              this.refreshInProgress = false;
              this.refreshSubject.next(null);
              this.auth.logout();
              this.router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
        }

        // If a refresh is already in progress, wait for it to complete and then retry
        return this.refreshSubject.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((newToken) => {
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next.handle(retryReq);
          })
        );
      })
    );
  }
}
