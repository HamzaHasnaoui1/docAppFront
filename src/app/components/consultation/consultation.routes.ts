import { Routes } from '@angular/router';

export const CONSULTATION_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des consultations',
    loadComponent: () =>
      import('./consultation-list/consultation-list.component').then(
        (c) => c.ConsultationListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouvelle consultation',
    loadComponent: () =>
      import('./create-consultation/create-consultation.component').then(
        (c) => c.CreateConsultationComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    title: 'Édition consultation',
    loadComponent: () =>
      import('./edit-consultation/edit-consultation.component').then(
        (c) => c.EditConsultationComponent
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
