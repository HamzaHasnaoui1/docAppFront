import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {Patient} from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private http: HttpClient) {}

  getPatients(page: number = 0, keyword: string = '', size: number = 15, medecinId?: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('keyword', keyword);
    
    if (medecinId) {
      params = params.set('medecinId', medecinId.toString());
    }

    return this.http.get<any>(`${environment.apiUrl}/user/patients`, { params });
  }



  createPatient( patient:Patient):Observable<Patient> {
    return this.http.post<Patient>(`${environment.apiUrl}/admin/patients`, patient);
  }

  updatePatient(id:number , patient:Patient):Observable<Patient> {
    return this.http.put<Patient>(`${environment.apiUrl}/admin/patients/${id}`, patient);
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${environment.apiUrl}/user/patients/${id}`);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/patients/${id}`);
  }

  createOrdonnance(rdvId: number, data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/ordonnances/${rdvId}`, data);
  }


}
