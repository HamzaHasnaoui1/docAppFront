import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DossierMedicalService } from '../../../service/dossier-medical.service';
import { DossierMedical } from '../../../models/dossierMedical.model';
import { Document } from '../../../models/document.model';
import { DocumentAttachmentComponent } from '../../../shared/document-attachment/document-attachment.component';

@Component({
  selector: 'app-dossier-medical-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DocumentAttachmentComponent],
  templateUrl: './dossier-medical-detail.component.html',
  styleUrl: './dossier-medical-detail.component.css'
})
export class DossierMedicalDetailComponent implements OnInit {
  dossierMedical: DossierMedical | null = null;
  documentForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private dossierMedicalService: DossierMedicalService,
    private fb: FormBuilder
  ) {
    this.documentForm = this.fb.group({
      nom: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: [''],
      categorie: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDossierMedical(+id);
    }
  }

  loadDossierMedical(id: number): void {
    this.loading = true;
    this.dossierMedicalService.getDossierMedical(id).subscribe({
      next: (dossier) => {
        this.dossierMedical = dossier;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dossier medical', error);
        this.errorMessage = 'Erreur lors du chargement du dossier médical';
        this.loading = false;
      }
    });
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadDocument(): void {
    if (this.documentForm.valid && this.selectedFile && this.dossierMedical) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const { nom, type, description, categorie } = this.documentForm.value;
      
      this.dossierMedicalService.uploadDocument(
        this.dossierMedical.id,
        nom,
        type,
        this.selectedFile,
        description,
        categorie
      ).subscribe({
        next: (updatedDossier) => {
          this.dossierMedical = updatedDossier;
          this.loading = false;
          this.successMessage = 'Document téléchargé avec succès';
          this.documentForm.reset();
          this.selectedFile = null;
        },
        error: (error) => {
          console.error('Error uploading document', error);
          this.errorMessage = 'Erreur lors du téléchargement du document';
          this.loading = false;
        }
      });
    }
  }

  onDocumentsUpdated(documents: Document[]): void {
    if (this.dossierMedical) {
      this.dossierMedical.documents = documents;
    }
  }
}
