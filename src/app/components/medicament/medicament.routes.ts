import { Routes } from '@angular/router';

export const MEDICAMENT_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des médicaments',
    loadComponent: () =>
      import('./medicament-list/medicament-list.component').then(
        (c) => c.MedicamentListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouveau médicament',
    loadComponent: () =>
      import('./create-medicament/create-medicament.component').then(
        (c) => c.CreateMedicamentComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    title: 'Édition médicament',
    loadComponent: () =>
      import('./edit-medicament/edit-medicament.component').then(
        (c) => c.EditMedicamentComponent
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
