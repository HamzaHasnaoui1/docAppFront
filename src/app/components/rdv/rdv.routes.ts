import { Routes } from '@angular/router';

export const RDV_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./rdv-list/rdv-list.component').then(
        (c) => c.RdvListComponent
      ),
    data: {
      title: 'Rendez-vous',                  
      childTitle: 'Liste des rendez-vous',   
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./create-rdv/create-rdv.component').then(
        (c) => c.CreateRdvComponent
      ),
    data: {
      title: 'Rendez-vous',                  
      childTitle: 'Planifier un rendez-vous', 
      breadcrumb: 'Création'
    }
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-rdv/edit-rdv.component').then(
        (c) => c.EditRdvComponent
      ),
    data: {
      title: 'Rendez-vous',                  
      childTitle: 'Modification complète',   
      breadcrumb: 'Édition complète'
    }
  },
  {
    path: 'edit-date/:id',
    loadComponent: () =>
      import('./edit-rdvD/edit-rdvD.component').then(
        (c) => c.EditRdvDComponent
      ),
    data: {
      title: 'Rendez-vous',                  
      childTitle: 'Modification de la date', 
      breadcrumb: 'Édition date'
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