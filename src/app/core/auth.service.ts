import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    const url = 'https://dummyjson.com/user/login';
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((res) => {
        if (res?.accessToken) {
          localStorage.setItem(this.accessKey, res.accessToken);
        }
        if (res?.refreshToken) {
          localStorage.setItem(this.refreshKey, res.refreshToken);
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

  refreshToken(): Observable<LoginResponse> {
    if (!isPlatformBrowser(this.platformId))
      return throwError(() => new Error('Refresh not available on server'));
    const refresh = this.getRefreshToken();
    if (!refresh) return throwError(() => new Error('No refresh token'));
    // Use the DummyJSON login endpoint to attempt a token refresh using the refresh token.
    // The demo API does not expose a dedicated refresh endpoint; we send the refresh token
    // in the body and expect the same token shape in the response (accessToken/refreshToken).
    const url = 'https://dummyjson.com/user/login';
    return this.http.post<LoginResponse>(url, { refreshToken: refresh }).pipe(
      tap((res) => {
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
      }),
      catchError((err) => throwError(() => err))
    );
  }

  getCurrentUser() {
    const url = 'https://dummyjson.com/user/me';
    return this.http.get(url);
  }
}
