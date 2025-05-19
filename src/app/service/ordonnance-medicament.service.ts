import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface OrdonnanceMedicamentDTO {
  id?: number;
  medicamentId: number; // Make this required since it's used in getMedicamentById
  medicament?: {
    id: number;
    nom?: string;
  };
  ordonnanceId?: number; // Already optional
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
    // Transform the DTO to match the backend expectations
    const backendDTO = this.transformToBackendFormat(medicament);
    console.log('Sending to backend (add):', backendDTO);
    
    return this.http.post<OrdonnanceMedicamentDTO>(
      `${environment.apiUrl}/admin/ordonnances/${ordonnanceId}/medicaments`,
      backendDTO
    );
  }

  updateMedicament(id: number, medicament: OrdonnanceMedicamentDTO): Observable<OrdonnanceMedicamentDTO> {
    // Transform the DTO to match the backend expectations
    const backendDTO = this.transformToBackendFormat(medicament);
    console.log('Sending to backend (update):', backendDTO);
    
    return this.http.put<OrdonnanceMedicamentDTO>(
      `${environment.apiUrl}/admin/ordonnances/medicaments/${id}`,
      backendDTO
    );
  }

  deleteMedicament(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/admin/ordonnances/medicaments/${id}`
    );
  }
  
  // Helper method to transform the DTO to match backend expectations
  private transformToBackendFormat(dto: OrdonnanceMedicamentDTO): any {
    // Create a new object with the expected structure
    const backendDTO: any = {
      dosage: dto.dosage,
      duree: dto.duree,
      frequence: dto.frequence
    };
    
    // Add ID if it exists
    if (dto.id) {
      backendDTO.id = dto.id;
    }
    
    // Add medicament ID in the format expected by the backend
    if (dto.medicament && dto.medicament.id) {
      backendDTO.medicament = { id: dto.medicament.id };
    } else if (dto.medicamentId) {
      backendDTO.medicament = { id: dto.medicamentId };
    }
    
    return backendDTO;
  }
}
