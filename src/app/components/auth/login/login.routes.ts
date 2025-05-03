import { Routes } from '@angular/router';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login.component').then((c) => c.LoginComponent),
  },
];
