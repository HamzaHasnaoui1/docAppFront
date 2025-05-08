import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
import {User} from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/auth/users/${userId}`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/admin/auth/update-user/${userId}`, userData);
  }
}
