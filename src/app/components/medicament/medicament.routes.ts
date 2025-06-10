import { Routes } from '@angular/router';

export const MEDICAMENT_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Médicaments', 
    loadComponent: () =>
      import('./medicament-list/medicament-list.component').then(
        (c) => c.MedicamentListComponent
      ),
    data: {
      title: 'Médicaments', 
      childTitle: 'Liste des médicaments', 
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Médicaments', 
    loadComponent: () =>
      import('./create-medicament/create-medicament.component').then(
        (c) => c.CreateMedicamentComponent
      ),
    data: {
      title: 'Médicaments', 
      childTitle: 'Nouveau médicament', 
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    title: 'Médicaments', 
    loadComponent: () =>
      import('./edit-medicament/edit-medicament.component').then(
        (c) => c.EditMedicamentComponent
      ),
    data: {
      title: 'Médicaments', 
      childTitle: 'Édition médicament',
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
