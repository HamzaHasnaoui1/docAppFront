import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Consultation} from '../models/consultation.model';
import {Patient} from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  constructor(private http:HttpClient) { }

  getConsultation(page: number = 0, keyword: string = '', size: number = 5): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('keyword', keyword);

    return this.http.get<any>(`${environment.apiUrl}/user/consultations`, { params });
  }

  createConsultation( consultation:Consultation):Observable<Consultation> {
    return this.http.post<Consultation>(`${environment.apiUrl}/admin/consultations`, consultation);
  }

  updateConsultation(id:number , consultation:Consultation):Observable<Consultation> {
    return this.http.put<Consultation>(`${environment.apiUrl}/admin/consultations/${id}`, consultation);
  }

  getConsultationById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${environment.apiUrl}/admin/consultations/${id}`);
  }

  deleteConsultation(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/consultations/${id}`);
  }
}
