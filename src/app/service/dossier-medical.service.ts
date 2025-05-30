import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierMedical } from '../models/dossierMedical.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DossierMedicalService {
  private apiUrl = `${environment.apiUrl}/user/dossiers-medicaux`;
  
  constructor(private http: HttpClient) { }
  
  getDossierMedical(id: number): Observable<DossierMedical> {
    return this.http.get<DossierMedical>(`${this.apiUrl}/${id}`);
  }
  
  getDossierMedicalByPatient(patientId: number): Observable<DossierMedical> {
    return this.http.get<DossierMedical>(`${environment.apiUrl}/user/patients/${patientId}/dossier-medical`);
  }
  
  // Method to upload document to a dossier medical
  uploadDocument(
    dossierMedicalId: number, 
    nom: string, 
    type: string, 
    file: File, 
    description?: string, 
    categorie?: string
  ): Observable<DossierMedical> {
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('type', type);
    
    if (description) {
      formData.append('description', description);
    }
    
    if (categorie) {
      formData.append('categorie', categorie);
    }
    
    formData.append('file', file);
    
    return this.http.post<DossierMedical>(`${environment.apiUrl}/admin/dossiers-medicaux/${dossierMedicalId}/documents`, formData);
  }
  
  // Méthode pour télécharger un document
  downloadDocument(dossierMedicalId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${dossierMedicalId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }
  
  // Méthode pour supprimer un document
  deleteDocument(dossierMedicalId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dossierMedicalId}/documents/${documentId}`);
  }
}
