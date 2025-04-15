import { Routes } from '@angular/router';

export const RDV_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des rendez-vous',
    loadComponent: () =>
      import('./rdv-list/rdv-list.component').then(
        (c) => c.RdvListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouveau rendez-vous',
    loadComponent: () =>
      import('./create-rdv/create-rdv.component').then(
        (c) => c.CreateRdvComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    title: 'Édition rendez-vous',
    loadComponent: () =>
      import('./edit-rdv/edit-rdv.component').then(
        (c) => c.EditRdvComponent
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
