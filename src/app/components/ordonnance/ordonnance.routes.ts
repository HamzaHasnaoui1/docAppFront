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
  {
    path: 'edit/:id',
    title: 'Édition ordonnance',
    loadComponent: () =>
      import('./edit-ordonnance/edit-ordonnance.component').then(
        (c) => c.EditOrdonnanceComponent
      ),
    data: {
      breadcrumb: 'Édition'
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
