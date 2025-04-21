import { Routes } from '@angular/router';

export const ORDONNANCE_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des ordonnances',
    loadComponent: () =>
      import('./ordonnance-list/ordonnance-list.component').then(
        (c) => c.OrdonnanceListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouvelle ordonannce',
    loadComponent: () =>
      import('./create-ordonnance/create-ordonnance.component').then(
        (c) => c.CreateOrdonnanceComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },

  // Redirections
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];
