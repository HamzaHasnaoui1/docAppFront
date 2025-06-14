import { Routes } from '@angular/router';
import {AuthGuard} from '../../components/auth/guards/auth.guard';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

export const LAYOUT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,

    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../dashboard/dashboard.component').then(c => c.DashboardComponent),
      },
      {
        path: 'patients',
        loadChildren: () => import('../../components/patient/patient.routes').then(m => m.PATIENT_ROUTES),
      },
      {
        path: 'medecin',
        loadChildren: () => import('../../components/medecin/medecin.routes').then(m => m.MEDECIN_ROUTES),
      },
      {
        path: 'notification',
        loadChildren: () => import('../../components/notification/notification.routes').then(m => m.NOTIFICATION_ROUTES),
      },
      {
        path: 'paiement',
        loadChildren: () => import('../../components/paiement/paiement.routes').then(m => m.PAIEMENT_ROUTES),
      },
      {
        path: 'ordonnances',
        loadChildren: () => import('../../components/ordonnance/ordonnance.routes').then(m => m.ORDONNANCE_ROUTES),
      },
      {
        path: 'dossierMedical',
        loadChildren: () => import('../../components/dossierMedical/dossierMedical.routes').then(m => m.DOSSIERMEDICAL_ROUTES),
      },
      {
        path: 'rdv',
        loadChildren: () => import('../../components/rdv/rdv.routes').then(m => m.RDV_ROUTES),
      },
      {
        path: 'user',
        loadChildren: () => import('../../components/user/user.routes').then(m => m.USER_ROUTES),
      },
      {
        path: 'medicament',
        loadChildren: () => import('../../components/medicament/medicament.routes').then(m => m.MEDICAMENT_ROUTES),
      },
      {
        path: 'admin',
        loadChildren: () => import('../../components/admin/admin.routes').then(m => m.ADMIN_ROUTES),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      }
    ]
  }
];
