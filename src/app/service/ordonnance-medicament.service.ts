// src/app/services/ordonnance-medicament.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrdonnanceMedicament } from '../models/OrdonnanceMedicament.model';

@Injectable({
  providedIn: 'root'
})
export class OrdonnanceMedicamentService {
  constructor(private http: HttpClient) {}

  getMedicamentsByOrdonnance(ordonnanceId: number): Observable<OrdonnanceMedicament[]> {
    return this.http.get<OrdonnanceMedicament[]>(
      `${environment.apiUrl}/user/ordonnances/${ordonnanceId}/medicaments`
    );
  }

  ajouterMedicament(ordonnanceId: number, medicament: OrdonnanceMedicament): Observable<OrdonnanceMedicament> {
    return this.http.post<OrdonnanceMedicament>(
      `${environment.apiUrl}/admin/ordonnances/${ordonnanceId}/medicaments`,
      this.toDto(medicament)
    );
  }

  updateMedicament(id: number, medicament: OrdonnanceMedicament): Observable<OrdonnanceMedicament> {
    return this.http.put<OrdonnanceMedicament>(
      `${environment.apiUrl}/admin/ordonnances/medicaments/${id}`,
      this.toDto(medicament)
    );
  }

  deleteMedicament(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/admin/ordonnances/medicaments/${id}`
    );
  }

  private toDto(medicament: OrdonnanceMedicament): any {
    return {
      id: medicament.id,
      ordonnanceId: medicament.ordonnanceId,
      medicament: medicament.medicament ? { id: medicament.medicament.id } : undefined,
      posologie: medicament.posologie,
      duree: medicament.duree,
      frequence: medicament.frequence,
      instructions: medicament.instructions
    };
  }
}
