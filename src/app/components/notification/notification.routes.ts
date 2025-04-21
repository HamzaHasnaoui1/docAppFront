import { Routes } from '@angular/router';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: 'list',
    title: 'Liste des notifications',
    loadComponent: () =>
      import('./notification-list/notification-list.component').then(
        (c) => c.NotificationListComponent
      ),
    data: {
      breadcrumb: 'Liste'
    }
  },
  {
    path: 'create',
    title: 'Nouvelle notification',
    loadComponent: () =>
      import('./create-notification/create-notification.component').then(
        (c) => c.CreateNotificationComponent
      ),
    data: {
      breadcrumb: 'Création'
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
