import { Routes } from '@angular/router';

export const DISPONIBILITE_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des disponibilites',
    loadComponent: () =>
      import('./disponibilite-medecin-list/disponibilite-medecin-list.component').then(
        (c) => c.DisponibiliteMedecinListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouvelle disponibilite',
    loadComponent: () =>
      import('./create-disponibilite-medecin/create-disponibilite-medecin.component').then(
        (c) => c.CreateDisponibiliteMedecinComponent
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
