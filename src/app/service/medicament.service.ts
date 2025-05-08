import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {Medicament} from '../models/Medicament.model';

@Injectable({
  providedIn: 'root'
})
export class MedicamentService {
  constructor(private http: HttpClient) {}

  getMedicaments(page: number = 0, keyword: string = '', size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('keyword', keyword);

    return this.http.get<any>(`${environment.apiUrl}/user/medicaments`, { params });
  }

  createMedicament(medicament: Medicament): Observable<Medicament> {
    return this.http.post<Medicament>(`${environment.apiUrl}/admin/medicaments`, medicament);
  }

  updateMedicament(id: number, medicament: Medicament): Observable<Medicament> {
    return this.http.put<Medicament>(`${environment.apiUrl}/admin/medicaments/${id}`, medicament);
  }

  getMedicamentById(id: number): Observable<Medicament> {
    return this.http.get<Medicament>(`${environment.apiUrl}/user/medicaments/${id}`);
  }

  deleteMedicament(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/medicaments/${id}`);
  }
}
