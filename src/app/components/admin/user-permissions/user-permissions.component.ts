import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { DirectivesModule } from '../../../directives/directives.module';
import { User } from '../../../models/auth-response.model';
import { Role, Permission } from '../../../models/permission.model';
import { PermissionService } from '../../../services/permission.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../components/auth/auth.service';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzSelectModule,
    NzSpinModule,
    NzModalModule,
    NzBadgeModule,
    DirectivesModule
  ],
  templateUrl: './user-permissions.component.html',
  styleUrls: ['./user-permissions.component.scss']
})
export class UserPermissionsComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  selectedUser: User | null = null;
  selectedRoles: string[] = [];
  loading = false;

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.medecinId) {
      this.message.error("Impossible de récupérer l'ID du médecin");
      this.loading = false;
      return;
    }

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Filtrer les utilisateurs par medecinId
        this.users = users.filter(user => user.medecinId === currentUser.medecinId);
        console.log('Utilisateurs chargés:', this.users);
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Erreur lors du chargement des utilisateurs');
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.loading = true;
    this.permissionService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        this.message.error('Erreur lors du chargement des rôles');
        console.error('Erreur lors du chargement des rôles', error);
        this.loading = false;
      }
    });
  }

  selectUser(user: User): void {
    console.log('Utilisateur sélectionné:', user);
    this.selectedUser = user;
    this.selectedRoles = user.roles || [];
  }

  updateUserRoles(): void {
    if (!this.selectedUser) {
      this.message.error('Aucun utilisateur sélectionné');
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.medecinId) {
      this.message.error("Impossible de récupérer l'ID du médecin");
      return;
    }

    console.log('Mise à jour des rôles pour:', this.selectedUser);
    console.log('ID utilisateur:', this.selectedUser.userId || this.selectedUser.id);
    console.log('Rôles sélectionnés:', this.selectedRoles);

    const userId = this.selectedUser.userId || this.selectedUser.id;

    if (!userId) {
      this.message.error('ID utilisateur non défini - problème avec l\'objet utilisateur');
      console.error('ID utilisateur manquant dans:', this.selectedUser);
      return;
    }

    const userToUpdate = {
      ...this.selectedUser,
      roles: this.selectedRoles,
      medecinId: currentUser.medecinId
    };

    this.loading = true;
    this.userService.updateUser(userId, userToUpdate).subscribe({
      next: () => {
        this.message.success('Rôles mis à jour avec succès');
        this.loadUsers();
        this.selectedUser = null;
        this.selectedRoles = [];
      },
      error: (error) => {
        this.message.error('Erreur lors de la mise à jour des rôles');
        console.error('Erreur lors de la mise à jour des rôles', error);
        this.loading = false;
      }
    });
  }

  getRolePermissions(roleName: string): Permission[] {
    const role = this.roles.find(r => r.roleName === roleName);
    return role ? role.permissions : [];
  }

  getAllPermissionsForUser(user: User): Permission[] {
    if (!user.roles || user.roles.length === 0) {
      return [];
    }

    const allPermissions: Permission[] = [];
    const permissionMap = new Map<number, Permission>();

    user.roles.forEach(roleName => {
      const role = this.roles.find(r => r.roleName === roleName);
      if (role && role.permissions) {
        role.permissions.forEach(permission => {
          if (!permissionMap.has(permission.id)) {
            permissionMap.set(permission.id, permission);
            allPermissions.push(permission);
          }
        });
      }
    });

    return allPermissions;
  }

  cancelEdit(): void {
    this.selectedUser = null;
    this.selectedRoles = [];
  }
}
