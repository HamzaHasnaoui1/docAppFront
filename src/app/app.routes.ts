import { Routes } from '@angular/router';
import { AuthGuard } from './components/auth/guards/auth.guard';
import { RoleGuard } from './components/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'doc',
    loadChildren: () => import('./features/layout/layout.routes').then(m => m.LAYOUT_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./components/auth/login/login.routes').then(m => m.LOGIN_ROUTES),
  },
  // Routes d'accès direct
  {
    path: 'gestion-permissions',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/admin/role-management/role-management.component').then(c => c.RoleManagementComponent),
  },
  {
    path: 'gestion-roles',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/admin/user-permissions/user-permissions.component').then(c => c.UserPermissionsComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
