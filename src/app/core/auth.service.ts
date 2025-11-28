import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, finalize, filter, take } from 'rxjs/operators';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  id?: number;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessKey = 'access_token';
  private refreshKey = 'refresh_token';
  // auth state observable
  private _authState = new BehaviorSubject<boolean>(false);
  readonly authState$ = this._authState.asObservable();

  // refresh coordination
  private refreshInProgress = false;
  private refreshSubject = new BehaviorSubject<LoginResponse | null>(null);
  private refreshTimer: any;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit?(): void {
    // not used in services; keep for compatibility
  }

  // initialize scheduling if token already present (call from app bootstrap if desired)
  initFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = this.getAccessToken();
    if (token) {
      this._authState.next(true);
      this.scheduleRefreshFromToken(token);
    }
  }

  /**
   * Login with optional expiresInMins for the demo API. DummyJSON accepts
   * { username, password, expiresInMins } to control token lifetime.
   */
  login(credentials: { username: string; password: string }, expiresInMins = 60): Observable<LoginResponse> {
    const url = 'https://dummyjson.com/user/login';
    const body: any = { ...credentials };
    if (typeof expiresInMins === 'number') {
      body.expiresInMins = expiresInMins;
    }
    return this.http.post<LoginResponse>(url, body).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          if (res?.accessToken) {
            try {
              localStorage.setItem(this.accessKey, res.accessToken);
            } catch {}
          }
          if (res?.refreshToken) {
            try {
              localStorage.setItem(this.refreshKey, res.refreshToken);
            } catch {}
          }
        }
        // set auth state and schedule refresh
        this._authState.next(true);
        if (res?.accessToken) {
          this.scheduleRefreshFromToken(res.accessToken);
        }
      }),
      catchError((err) => throwError(() => err))
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.accessKey);
        localStorage.removeItem(this.refreshKey);
      } catch {}
    }
    // clear scheduled refresh and update state
    if (this.refreshTimer) {
      try {
        clearTimeout(this.refreshTimer);
      } catch {}
      this.refreshTimer = undefined;
    }
    this._authState.next(false);
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem(this.accessKey);
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem(this.refreshKey);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  refreshToken(expiresInMins = 60): Observable<LoginResponse> {
    // allow caller to request a specific TTL for the refreshed token
    if (!isPlatformBrowser(this.platformId))
      return throwError(() => new Error('Refresh not available on server'));
    const refresh = this.getRefreshToken();
    if (!refresh) return throwError(() => new Error('No refresh token'));
    // Use the DummyJSON login endpoint to attempt a token refresh using the refresh token.
    // The demo API does not expose a dedicated refresh endpoint; we send the refresh token
    // (and optional expiresInMins) in the body and expect the same token shape in the response (accessToken/refreshToken).
    const url = 'https://dummyjson.com/user/login';
    const body: any = { refreshToken: refresh };
    if (typeof expiresInMins === 'number') body.expiresInMins = expiresInMins;
    return this.http.post<LoginResponse>(url, body).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          if (res?.accessToken) {
            try {
              localStorage.setItem(this.accessKey, res.accessToken);
            } catch {}
          }
          if (res?.refreshToken) {
            try {
              localStorage.setItem(this.refreshKey, res.refreshToken);
            } catch {}
          }
        }
      }),
      catchError((err) => throwError(() => err))
    );
  }

  /** Centralized refresh that queues concurrent callers and schedules next refresh */
  performRefresh(): Observable<LoginResponse> {
    if (!isPlatformBrowser(this.platformId))
      return throwError(() => new Error('Refresh not available on server'));

    if (this.refreshInProgress) {
      // wait for existing refresh result
      return this.refreshSubject.pipe(
        filter((v) => v !== null),
        take(1)
      ) as unknown as Observable<LoginResponse>;
    }

    this.refreshInProgress = true;
    return this.refreshToken().pipe(
      tap((res) => {
        // schedule next refresh point
        if (res?.accessToken) {
          this.scheduleRefreshFromToken(res.accessToken);
        }
        this.refreshSubject.next(res);
        this._authState.next(true);
      }),
      finalize(() => {
        this.refreshInProgress = false;
      }),
      catchError((err) => {
        this.logout();
        this.refreshSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  private scheduleRefreshFromToken(token: string) {
    // clear any previous timer
    if (this.refreshTimer) {
      try {
        clearTimeout(this.refreshTimer);
      } catch {}
      this.refreshTimer = undefined;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs = payload.exp * 1000;
      const refreshBeforeMs = 60 * 1000; // refresh 60s before expiry
      const msUntilRefresh = expMs - Date.now() - refreshBeforeMs;
      if (msUntilRefresh <= 0) {
        // immediate refresh
        this.performRefresh().subscribe({ next: () => {}, error: () => {} });
        return;
      }
      this.refreshTimer = setTimeout(() => {
        this.performRefresh().subscribe({ next: () => {}, error: () => {} });
      }, msUntilRefresh);
    } catch {
      // ignore parse error
    }
  }

  getCurrentUser() {
    const url = 'https://dummyjson.com/user/me';
    return this.http.get(url);
  }
}
