import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'edit-profile',
    title: 'Profil', 
    loadComponent: () =>
      import('./edit-profile/edit-profile.component').then(
        (c) => c.EditProfileComponent
      ),
    data: {
      title: 'Profil', 
      childTitle: 'Édition du profil', 
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
