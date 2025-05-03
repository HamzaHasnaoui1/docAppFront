// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {AuthRequest, JwtResponse, User} from '../../models/auth-response.model';
import {environment} from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: AuthRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.startTokenExpirationTimer(response.token);

          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles,
            active: true,
            firstName: '',
            lastName: ''
          };

          this.currentUserSubject.next(user);
        })
      );
  }


  logout(): void {
    localStorage.removeItem('auth_data');
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  private storeAuthData(authData: JwtResponse): void {
    localStorage.setItem('auth_data', JSON.stringify(authData));
  }

  getToken(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.token : null;
  }

  getAuthData(): JwtResponse | null {
    const authDataString = localStorage.getItem('auth_data');
    if (authDataString) {
      return JSON.parse(authDataString);
    }
    return null;
  }

  private checkAuthStatus(): void {
    const authData = this.getAuthData();
    if (authData && authData.token) {
      // Check if token is expired
      const jwtTokenParts = authData.token.split('.');
      if (jwtTokenParts.length === 3) {
        try {
          const tokenPayload = JSON.parse(atob(jwtTokenParts[1]));
          const expirationDate = new Date(tokenPayload.exp * 1000);

          if (expirationDate > new Date()) {
            // Token is still valid
            const user: User = {
              id: authData.id,
              username: authData.username,
              email: authData.email,
              roles: authData.roles,
              active: true,
              firstName: '',
              lastName: ''
            };

            this.currentUserSubject.next(user);
            this.startTokenExpirationTimer(authData.token);
          } else {
            // Token expired
            this.logout();
          }
        } catch (error) {
          console.error('Error parsing token', error);
          this.logout();
        }
      }
    }
  }

  private startTokenExpirationTimer(token: string): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    try {
      const jwtTokenParts = token.split('.');
      if (jwtTokenParts.length === 3) {
        const tokenPayload = JSON.parse(atob(jwtTokenParts[1]));
        const expirationDate = new Date(tokenPayload.exp * 1000);
        const timeUntilExpiration = expirationDate.getTime() - new Date().getTime();

        if (timeUntilExpiration > 0) {
          this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
          }, timeUntilExpiration);
        }
      }
    } catch (error) {
      console.error('Error setting expiration timer', error);
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.roles.some(r => r.toLowerCase() === role.toLowerCase());
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id || null : null;
  }
}
