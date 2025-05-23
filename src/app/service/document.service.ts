import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';
import { DossierMedical } from '../models/dossierMedical.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/user/dossiers-medicaux`;
  
  constructor(private http: HttpClient) { }
  
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
  
  getDocumentsByDossierMedical(dossierMedicalId: number): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/${dossierMedicalId}/documents`);
  }
  
  getDocumentById(dossierMedicalId: number, documentId: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${dossierMedicalId}/documents/${documentId}`);
  }
  
  deleteDocument(dossierMedicalId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${dossierMedicalId}/documents/${documentId}`);
  }
  
  downloadDocument(dossierMedicalId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${dossierMedicalId}/documents/${documentId}/download`, {
      responseType: 'blob'
    });
  }
} 