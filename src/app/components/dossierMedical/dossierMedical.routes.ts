import { Routes } from '@angular/router';

export const DOSSIERMEDICAL_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des dossiers medical',
    loadComponent: () =>
      import('./dossier-medical-list/dossier-medical-list.component').then(
        (c) => c.DossierMedicalListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouveaux Dossier',
    loadComponent: () =>
      import('./create-dossier-medical/create-dossier-medical.component').then(
        (c) => c.CreateDossierMedicalComponent
      ),
    data: {
      breadcrumb: 'Création'
    }
  },
  {
    path: 'detail/:id',
    title: 'Detail dossier',
    loadComponent: () =>
      import('./dossier-medical-detail/dossier-medical-detail.component').then(
        (c) => c.DossierMedicalDetailComponent
      ),
    data: {
      breadcrumb: 'Detail'
    }
  },
  {
    path: 'edit/:id',
    title: 'Édition dossier-medical',
    loadComponent: () =>
      import('./edit-dossier-medical/edit-dossier-medical.component').then(
        (c) => c.EditDossierMedicalComponent
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
