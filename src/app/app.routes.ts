import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'doc',
    loadChildren: () => import('./features/layout/layout.routes').then(m => m.LAYOUT_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./components/auth/login/login.routes').then(m => m.LOGIN_ROUTES),
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
