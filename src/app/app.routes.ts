import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'doc',
    loadChildren: () => import('./features/layout/layout.routes').then(c => c.LAYOUT_ROUTES)
  },
  {
    path: '',
    redirectTo: 'doc',
    pathMatch: 'full'
  }
];
