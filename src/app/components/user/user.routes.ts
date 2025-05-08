import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'edit-profile',
    title: 'Édition du profil',
    loadComponent: () =>
      import('./edit-profile/edit-profile.component').then(
        (c) => c.EditProfileComponent
      ),
    data: {
      breadcrumb: 'Édition du profil'
    }
  },
  {
    path: '',
    redirectTo: 'edit-profile',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'edit-profile'
  }
];
