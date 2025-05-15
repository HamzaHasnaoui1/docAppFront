import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DonneesPhysiologiques } from '../models/DonneesPhysiologiques.model';

@Injectable({
  providedIn: 'root'
})
export class DonneesPhysiologiquesService {
  constructor(private http: HttpClient) {}

  getDonneesByRdvId(rendezVousId: number): Observable<DonneesPhysiologiques> {
    return this.http.get<DonneesPhysiologiques>(
      `${environment.apiUrl}/user/rdv/${rendezVousId}/donnees-physiologiques`
    );
  }

  saveDonneesPhysiologiques(
    donnees: DonneesPhysiologiques,
    rendezVousId: number
  ): Observable<DonneesPhysiologiques> {
    return this.http.post<DonneesPhysiologiques>(
      `${environment.apiUrl}/user/rdv/${rendezVousId}/donnees-physiologiques`,
      donnees
    );
  }

  getLatestDonneesByPatient(patientId: number): Observable<DonneesPhysiologiques[]> {
    return this.http.get<DonneesPhysiologiques[]>(
      `${environment.apiUrl}/user/patients/${patientId}/donnees-physiologiques/latest`
    );
  }

  getDonneesHistoryByPatient(
    patientId: number,
    startDate: Date,
    endDate: Date
  ): Observable<DonneesPhysiologiques[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<DonneesPhysiologiques[]>(
      `${environment.apiUrl}/user/patients/${patientId}/donnees-physiologiques/history`,
      { params }
    );
  }

  updateDonneesPhysiologiques(
    id: number,
    donnees: DonneesPhysiologiques
  ): Observable<DonneesPhysiologiques> {
    return this.http.put<DonneesPhysiologiques>(
      `${environment.apiUrl}/user/donnees-physiologiques/${id}`,
      donnees
    );
  }
}
