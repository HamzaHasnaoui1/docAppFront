import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {RendezVous} from '../models/rdv.model';
import {Patient} from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class RdvService {
  constructor(private http: HttpClient) {}

  getRdvs(page: number = 0, size: number = 5): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)

    return this.http.get<any>(`${environment.apiUrl}/user/rdv`, { params });
  }

  getRdvsMedecin(medecinId: number = 1): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/user/medecins/${medecinId}/rdv`);
  }

  createRdv( rdv:RendezVous):Observable<RendezVous> {
    return this.http.post<RendezVous>(`${environment.apiUrl}/admin/rdv`, rdv);
  }

  updateRdv(id:number , rdv:RendezVous):Observable<RendezVous> {
    return this.http.put<RendezVous>(`${environment.apiUrl}/admin/rdv/${id}`, rdv);
  }

  getRdvById(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${environment.apiUrl}/user/rdv/${id}`);
  }

  deleteRdv(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/rdv/${id}`);
  }

  getAllRdvs(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${environment.apiUrl}/user/rdv/all`);
  }
}
