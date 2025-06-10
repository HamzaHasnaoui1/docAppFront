import { Routes } from '@angular/router';

export const MEDECIN_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./medecin-list/medecin-list.component').then(
        (c) => c.MedecinListComponent
      ),
    data: {
      title: 'Médecins',                 
      childTitle: 'Liste des médecins',  
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./create-medecin/create-medecin.component').then(
        (c) => c.CreateMedecinComponent
      ),
    data: {
      title: 'Médecins',                 
      childTitle: 'Ajout d\'un médecin',  
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-medecin/edit-medecin.component').then(
        (c) => c.EditMedecinComponent
      ),
    data: {
      title: 'Médecins',                 
      childTitle: 'Modification médecin', 
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