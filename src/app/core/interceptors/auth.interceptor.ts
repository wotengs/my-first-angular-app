import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // refresh coordination is handled centrally in AuthService.performRefresh()

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

        // Attempt refresh via centralized service. AuthService.performRefresh() queues concurrent callers.
        return this.auth.performRefresh().pipe(
          switchMap(() => {
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
            this.auth.logout();
            this.router.navigate(['/login']);
            return throwError(() => refreshErr);
          })
        );
      })
    );
  }
}
