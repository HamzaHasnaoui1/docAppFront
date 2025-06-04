import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Document } from '../../models/document.model';
import { DossierMedicalService } from '../../service/dossier-medical.service';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzMessageService } from 'ng-zorro-antd/message';
import {NzInputDirective} from 'ng-zorro-antd/input';

@Component({
  selector: 'app-document-attachment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzButtonModule,
    NzUploadModule,
    NzMessageModule,
    NzFormModule,
    NzSelectModule,
    NzTableModule,
    NzIconModule,
    NzSpinModule,
    NzProgressModule,
    NzInputDirective
  ],
  templateUrl: './document-attachment.component.html',
  styleUrls: ['./document-attachment.component.scss']
})
export class DocumentAttachmentComponent implements OnInit {
  @Input() dossierMedicalId!: number;
  @Input() documents: Document[] = [];
  @Output() documentsUpdated = new EventEmitter<Document[]>();

  documentForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  uploadProgress = 0;
  successMessage = '';
  errorMessage = '';
  isModalVisible = false;

  documentTypes = [
    { value: 'radiographie', label: 'Radiographie' },
    { value: 'ordonnance', label: 'Ordonnance' },
    { value: 'analyse', label: 'Résultat d\'analyse' },
    { value: 'compte-rendu', label: 'Compte-rendu médical' },
    { value: 'autre', label: 'Autre' }
  ];

  documentCategories = [
    { value: 'resultat_analyse', label: 'Résultat d\'analyse' },
    { value: 'compte_rendu', label: 'Compte rendu' },
    { value: 'radio', label: 'Radio' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'autre', label: 'Autre' }
  ];

  constructor(
    private fb: FormBuilder,
    private dossierMedicalService: DossierMedicalService,
    private messageService: NzMessageService
  ) {
    this.documentForm = this.fb.group({
      nom: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: [''],
      categorie: ['']
    });
  }

  ngOnInit(): void {
    this.loadDossierMedical();
  }

  loadDossierMedical(): void {
    if (this.dossierMedicalId) {
      this.loading = true;
      this.dossierMedicalService.getDossierMedical(this.dossierMedicalId).subscribe({
        next: (dossier) => {
          if (dossier && dossier.documents) {
            this.documents = dossier.documents;
            this.documentsUpdated.emit(dossier.documents);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dossier medical', error);
          this.errorMessage = 'Erreur lors du chargement du dossier médical';
          this.loading = false;
          this.messageService.error('Impossible de charger les documents');
        }
      });
    }
  }

  showModal(): void {
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.resetForm();
  }

  resetForm(): void {
    this.documentForm.reset();
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadDocument(): void {
    if (this.documentForm.valid && this.selectedFile && this.dossierMedicalId) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { nom, type, description, categorie } = this.documentForm.value;

      this.dossierMedicalService.uploadDocument(
        this.dossierMedicalId,
        nom,
        type,
        this.selectedFile,
        description,
        categorie
      ).subscribe({
        next: (dossierMedical) => {
          if (dossierMedical && dossierMedical.documents) {
            this.documents = dossierMedical.documents;
            this.documentsUpdated.emit(this.documents);
          }
          this.loading = false;
          this.successMessage = 'Document téléchargé avec succès';
          this.messageService.success('Document téléchargé avec succès');
          this.isModalVisible = false;
          this.resetForm();
        },
        error: (error) => {
          console.error('Error uploading document', error);
          this.errorMessage = 'Erreur lors du téléchargement du document';
          this.loading = false;
          this.messageService.error('Erreur lors du téléchargement du document');
        }
      });
    }
  }

  downloadDocument(doc: Document): void {
    if (doc.urlAcces) {
      window.open(doc.urlAcces, '_blank');
    } else {
      this.messageService.warning('La fonctionnalité de téléchargement nécessite une mise à jour du backend');
    }
  }

  deleteDocument(doc: Document): void {
    this.messageService.warning('La fonctionnalité de suppression nécessite une mise à jour du backend');
  }
}
