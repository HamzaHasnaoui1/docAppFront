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
        path: 'rdv',
        loadChildren: () =>
          import('../../components/rdv/rdv.routes').then(
            (c) => c.RDV_ROUTES
          ),
      },
      {
        path: 'consultations',
        loadChildren: () =>
          import('../../components/consultation/consultation.routes').then(
            (c) => c.CONSULTATION_ROUTES
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
