import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'doc',
    loadChildren: () => import('./features/layout/layout.routes').then(c => c.LAYOUT_ROUTES)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent)
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
