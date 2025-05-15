import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {AuthRequest, JwtResponse, User} from '../../models/auth-response.model';
import {environment} from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenExpirationTimer: any;

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
    console.log('Utilisateur courant au chargement :', this.currentUserValue);
  }

  login(credentials: AuthRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.startTokenExpirationTimer(response.token);

          const user: User = {
            id: response.userId,
            username: response.username,
            email: response.email,
            roles: response.roles,
            active: true,
            firstName: '',
            lastName: ''
          };

          this.currentUserSubject.next(user);
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Une erreur est survenue';
          if (error.status === 400 || error.status === 401 || error.status === 403) {
            errorMessage = 'Username ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
          }

          console.error('Login error:', error);

          return throwError(() => ({
            status: error.status,
            message: errorMessage,
            originalError: error
          }));
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
      const jwtTokenParts = authData.token.split('.');
      if (jwtTokenParts.length === 3) {
        try {
          const tokenPayload = JSON.parse(atob(jwtTokenParts[1]));
          const expirationDate = new Date(tokenPayload.exp * 1000);

          if (expirationDate > new Date()) {
            const user: User = {
              id: authData.userId,
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
            this.logout();
          }
        } catch (error) {
          console.error('Erreur de parsing du token :', error);
          this.logout();
        }
      } else {
        this.logout();
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
}
