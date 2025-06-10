import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./patient-list/patient-list.component').then(
        (c) => c.PatientListComponent
      ),
    data: {
      title: 'Patients',                 
      childTitle: 'Liste des patients',   
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./create-patient/create-patient.component').then(
        (c) => c.CreatePatientComponent
      ),
    data: {
      title: 'Patients',                 
      childTitle: 'Création d\'un patient', 
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-patient/edit-patient.component').then(
        (c) => c.EditPatientComponent
      ),
    data: {
      title: 'Patients',                
      childTitle: 'Modification patient', 
      breadcrumb: 'Édition'
    }
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./patient-detail/patient-detail.component').then(
        (c) => c.PatientDetailComponent
      ),
    data: {
      title: 'Patients',                 
      childTitle: 'Détails du patient',   
      breadcrumb: 'Detail'
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