import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Patient} from '../models/patient.model';
import {Medecin} from '../models/medecin.model';

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  constructor(private http: HttpClient) {}

  getMedecins(page: number = 0, size: number = 5, keyword: string = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('keyword', keyword);

    return this.http.get<any>(`${environment.apiUrl}/user/medecins`, { params });
  }

  updateMedecin(id:number , medecin:Medecin):Observable<Medecin> {
    return this.http.put<Medecin>(`${environment.apiUrl}/admin/medecins/${id}`, medecin);
  }

  createMedecin( medecin:Medecin):Observable<Medecin> {
    return this.http.post<Medecin>(`${environment.apiUrl}/admin/medecins`, medecin);
  }

  getMedecinById(id: number): Observable<Medecin> {
    return this.http.get<Medecin>(`${environment.apiUrl}/user/medecins/${id}`);
  }

  deleteMedecin(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/medecins/${id}`);
  }
}
