import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ordonnance } from '../models/ordonnance.model';

@Injectable({
  providedIn: 'root'
})
export class OrdonnanceService {

  constructor(private http: HttpClient) { }

  getOrdonnances(page: number = 0, keyword: string = '', size: number = 5): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('keyword', keyword);

    return this.http.get<any>(`${environment.apiUrl}/user/ordonnances`, { params });
  }

  createOrdonnance(ordonnance: Ordonnance): Observable<Ordonnance> {
    const rendezVousId = ordonnance.rendezVous?.id;
    
    if (!rendezVousId) {
      throw new Error('RendezVous ID is required to create an ordonnance');
    }
    
    return this.http.post<Ordonnance>(`${environment.apiUrl}/admin/ordonnances/${rendezVousId}`, ordonnance);
  }

  updateOrdonnance(id: number, ordonnance: Ordonnance): Observable<Ordonnance> {
    return this.http.put<Ordonnance>(`${environment.apiUrl}/admin/ordonnances/${id}`, ordonnance);
  }

  getOrdonnanceById(id: number): Observable<Ordonnance> {
    return this.http.get<Ordonnance>(`${environment.apiUrl}/user/ordonnances/${id}`);
  }

  deleteOrdonnance(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/ordonnances/${id}`);
  }
}
