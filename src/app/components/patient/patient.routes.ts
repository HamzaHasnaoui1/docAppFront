import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des patients',
    loadComponent: () =>
      import('./patient-list/patient-list.component').then(
        (c) => c.PatientListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouveau patient',
    loadComponent: () =>
      import('./create-patient/create-patient.component').then(
        (c) => c.CreatePatientComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    title: 'Édition patient',
    loadComponent: () =>
      import('./edit-patient/edit-patient.component').then(
        (c) => c.EditPatientComponent
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
