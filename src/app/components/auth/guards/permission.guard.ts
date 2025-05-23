import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as Array<string>;
    const permissionMode = route.data['permissionMode'] as 'any' | 'all' || 'any';

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    let hasRequiredPermissions: boolean;
    
    if (permissionMode === 'all') {
      hasRequiredPermissions = this.authService.hasAllPermissions(requiredPermissions);
    } else {
      hasRequiredPermissions = this.authService.hasAnyPermission(requiredPermissions);
    }

    if (hasRequiredPermissions) {
      return true;
    }

    this.router.navigate(['/doc/dashboard']);
    return false;
  }
} 