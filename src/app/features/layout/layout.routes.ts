import { Routes } from '@angular/router';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout.component').then((c) => c.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('../../components/patient/patient.routes').then(
            (c) => c.PATIENT_ROUTES
          ),
      },
      {
        path: 'medecin',
        loadChildren: () =>
          import('../../components/medecin/medecin.routes').then(
            (c) => c.MEDECIN_ROUTES
          ),
      },
      {
        path: 'notification',
        loadChildren: () =>
          import('../../components/notification/notification.routes').then(
            (c) => c.NOTIFICATION_ROUTES
          ),
      },
      {
        path: 'paiement',
        loadChildren: () =>
          import('../../components/paiement/paiement.routes').then(
            (c) => c.PAIEMENT_ROUTES
          ),
      },
      {
        path: 'ordonnance',
        loadChildren: () =>
          import('../../components/ordonnance/ordonnance.routes').then(
            (c) => c.ORDONNANCE_ROUTES
          ),
      },
      {
        path: 'dossierMedical',
        loadChildren: () =>
          import('../../components/dossierMedical/dossierMedical.routes').then(
            (c) => c.DOSSIERMEDICAL_ROUTES
          ),
      },
      {
        path: 'rdv',
        loadChildren: () =>
          import('../../components/rdv/rdv.routes').then(
            (c) => c.RDV_ROUTES
          ),
      },
     /* {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },*/
    ],
  },
];
