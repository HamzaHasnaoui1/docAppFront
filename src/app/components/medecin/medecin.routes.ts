import { Routes } from '@angular/router';

export const MEDECIN_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des médecins',
    loadComponent: () =>
      import('./medecin-list/medecin-list.component').then(
        (c) => c.MedecinListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouveau médecin',
    loadComponent: () =>
      import('./create-medecin/create-medecin.component').then(
        (c) => c.CreateMedecinComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    title: 'Édition médecin',
    loadComponent: () =>
      import('./edit-medecin/edit-medecin.component').then(
        (c) => c.EditMedecinComponent
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
