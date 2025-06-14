import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { Permission, Role } from '../../../models/permission.model';
import { PermissionService } from '../../../service/permission.service';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardComponent, NzCardModule } from 'ng-zorro-antd/card';
import { DirectivesModule } from '../../../directives/directives.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagComponent, NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarComponent, NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    DirectivesModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzCollapseModule,
    NzIconModule,
    NzModalModule,
    NzMessageModule,
    NzListModule,
    NzTagModule,
    NzAvatarModule,
    NzBadgeModule,
    NzGridModule,
    NzEmptyModule
  ]
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  permissionsByCategory: { [key: string]: Permission[] } = {};
  categories: string[] = [];
  loading = false;


  roleForm: FormGroup;
  selectedRole: Role | null = null;

  displayedColumns: string[] = ['roleName', 'description', 'actions'];

  constructor(
    private permissionService: PermissionService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private modalService: NzModalService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required]],
      description: [''],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    console.log('RoleManagementComponent initialized');
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    console.log('Loading roles...');
    this.permissionService.getAllRoles().subscribe({
      next: (roles) => {
        console.log('Roles loaded successfully:', roles);
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.message.error('Erreur lors du chargement des rôles');
      }
    });
  }

  loadPermissions(): void {
    console.log('Loading permissions...');
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        console.log('Permissions loaded successfully:', permissions);
        this.permissions = permissions;
        this.organizePermissionsByCategory();
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.message.error('Erreur lors du chargement des permissions');
      }
    });
  }

  organizePermissionsByCategory(): void {
    this.permissionsByCategory = {};
    this.categories = [];

    this.permissions.forEach(permission => {
      if (!this.permissionsByCategory[permission.category]) {
        this.permissionsByCategory[permission.category] = [];
        this.categories.push(permission.category);
      }
      this.permissionsByCategory[permission.category].push(permission);
    });
  }

  selectRole(role: Role): void {
    this.selectedRole = role;
    this.roleForm.patchValue({
      roleName: role.roleName,
      description: role.description,
      permissions: role.permissions.map(p => p.id)
    });
  }

  clearForm(): void {
    this.selectedRole = null;
    this.roleForm.reset();
  }

  saveRole(): void {
    if (this.roleForm.invalid) {
      return;
    }

    const roleData = this.roleForm.value;
    const selectedPermissions = this.permissions
      .filter(p => roleData.permissions.includes(p.id))
      .map(p => ({ id: p.id, name: p.name, description: p.description, category: p.category }));

    const role: Role = {
      ...roleData,
      permissions: selectedPermissions
    };

    if (this.selectedRole) {
      // Mise à jour d'un rôle existant
      this.permissionService.updateRole(this.selectedRole.roleId, role).subscribe({
        next: () => {
          this.message.success('Rôle mis à jour avec succès');
          this.loadRoles();
          this.clearForm();
        },
        error: (error) => {
          this.message.error('Erreur lors de la mise à jour du rôle');
          console.error('Erreur lors de la mise à jour du rôle', error);
        }
      });
    } else {
      // Création d'un nouveau rôle
      this.permissionService.createRole(role).subscribe({
        next: () => {
          this.message.success('Rôle créé avec succès');
          this.loadRoles();
          this.clearForm();
        },
        error: (error) => {
          this.message.error('Erreur lors de la création du rôle');
          console.error('Erreur lors de la création du rôle', error);
        }
      });
    }
  }

  deleteRole(role: Role): void {
    this.modalService.confirm({
      nzTitle: 'Êtes-vous sûr de vouloir supprimer ce rôle?',
      nzContent: `Le rôle "${role.roleName}" sera définitivement supprimé.`,
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzCancelText: 'Non',
      nzOnOk: () => {
        this.permissionService.deleteRole(role.roleId).subscribe({
          next: () => {
            this.message.success('Rôle supprimé avec succès');
            this.loadRoles();
            if (this.selectedRole?.roleId === role.roleId) {
              this.clearForm();
            }
          },
          error: (error) => {
            this.message.error('Erreur lors de la suppression du rôle');
            console.error('Erreur lors de la suppression du rôle', error);
          }
        });
      }
    });
  }

  isPermissionSelected(permissionId: number): boolean {
    const permissions = this.roleForm.get('permissions')?.value || [];
    return permissions.includes(permissionId);
  }

  togglePermission(permissionId: number): void {
    const permissions = [...(this.roleForm.get('permissions')?.value || [])];
    const index = permissions.indexOf(permissionId);

    if (index === -1) {
      permissions.push(permissionId);
    } else {
      permissions.splice(index, 1);
    }

    this.roleForm.patchValue({ permissions });
  }
}
