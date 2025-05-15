import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrdonnanceMedicamentDTO {
  id?: number;
  medicamentId: number;
  ordonnanceId?: number;
  dosage: string;
  duree: string;
  frequence: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdonnanceMedicamentService {
  constructor(private http: HttpClient) {}

  getMedicamentsByOrdonnance(ordonnanceId: number): Observable<OrdonnanceMedicamentDTO[]> {
    return this.http.get<OrdonnanceMedicamentDTO[]>(
      `${environment.apiUrl}/user/ordonnances/${ordonnanceId}/medicaments`
    );
  }

  ajouterMedicament(ordonnanceId: number, medicament: OrdonnanceMedicamentDTO): Observable<OrdonnanceMedicamentDTO> {
    return this.http.post<OrdonnanceMedicamentDTO>(
      `${environment.apiUrl}/admin/ordonnances/${ordonnanceId}/medicaments`,
      medicament
    );
  }

  updateMedicament(id: number, medicament: OrdonnanceMedicamentDTO): Observable<OrdonnanceMedicamentDTO> {
    return this.http.put<OrdonnanceMedicamentDTO>(
      `${environment.apiUrl}/admin/ordonnances/medicaments/${id}`,
      medicament
    );
  }

  deleteMedicament(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/admin/ordonnances/medicaments/${id}`
    );
  }
}
