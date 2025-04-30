import { Routes } from '@angular/router';

export const PAIEMENT_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des paiements',
    loadComponent: () =>
      import('./paiement-list/paiement-list.component').then(
        (c) => c.PaiementListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouveaux paiement',
    loadComponent: () =>
      import('./create-paiement/create-paiement.component').then(
        (c) => c.CreatePaiementComponent
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
