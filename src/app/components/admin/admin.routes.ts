import { Routes } from '@angular/router';
import { RoleGuard } from '../auth/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'roles',
    title: 'Gestion des rôles',
    loadComponent: () =>
      import('./role-management/role-management.component').then(
        (c) => c.RoleManagementComponent
      ),
    canActivate: [RoleGuard],
    data: {
      title: 'Administration',
      childTitle: 'Gestion des rôles',
      breadcrumb: 'Rôles',
      roles: ['ADMIN']
    }
  },
  {
    path: 'permissions',
    title: 'Gestion des permissions utilisateurs',
    loadComponent: () =>
      import('./user-permissions/user-permissions.component').then(
        (c) => c.UserPermissionsComponent
      ),
    canActivate: [RoleGuard],
    data: {
      title: 'Administration',
      childTitle: 'Gestion des permissions utilisateurs',
      breadcrumb: 'Permissions utilisateurs',
      roles: ['ADMIN']
    }
  },
  // Redirections
  {
    path: '',
    redirectTo: 'roles',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'roles'
  }
];
