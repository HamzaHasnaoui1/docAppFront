import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Permission, Role } from '../models/permission.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/admin/roles-permissions`;

  constructor(private http: HttpClient) { }

  // ===== API pour les rôles =====
  
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }
  
  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }
  
  getRoleByName(name: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/name/${name}`);
  }
  
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }
  
  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role);
  }
  
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }
  
  // ===== API pour les permissions =====
  
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`);
  }
  
  getPermissionsByCategory(category: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions/category/${category}`);
  }
  
  getPermissionById(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/permissions/${id}`);
  }
  
  createPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(`${this.apiUrl}/permissions`, permission);
  }
  
  updatePermission(id: number, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/permissions/${id}`, permission);
  }
  
  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permissions/${id}`);
  }
  
  // ===== API pour associer/dissocier des permissions aux rôles =====
  
  addPermissionToRole(roleId: number, permissionId: number): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`, {});
  }
  
  removePermissionFromRole(roleId: number, permissionId: number): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`);
  }
} 