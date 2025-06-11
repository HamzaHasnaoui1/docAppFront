import { Routes } from '@angular/router';

export const DOSSIERMEDICAL_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./dossier-medical-list/dossier-medical-list.component').then(
        (c) => c.DossierMedicalListComponent
      ),
    data: {
      title: 'Dossiers médicaux',                 
      childTitle: 'Liste des dossiers',            
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./create-dossier-medical/create-dossier-medical.component').then(
        (c) => c.CreateDossierMedicalComponent
      ),
    data: {
      title: 'Dossiers médicaux',                
      childTitle: 'Création d\'un dossier',        
      breadcrumb: 'Création'
    }
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./dossier-medical-detail/dossier-medical-detail.component').then(
        (c) => c.DossierMedicalDetailComponent
      ),
    data: {
      title: 'Dossiers médicaux',                 
      childTitle: 'Détails du dossier médical',    
      breadcrumb: 'Detail'
    }
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-dossier-medical/edit-dossier-medical.component').then(
        (c) => c.EditDossierMedicalComponent
      ),
    data: {
      title: 'Dossiers médicaux',                 
      childTitle: 'Modification du dossier',       
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