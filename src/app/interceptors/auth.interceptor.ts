import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../components/auth/auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('AuthInterceptor - Requête:', req.url);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  console.log('Token disponible:', !!token);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
}; 