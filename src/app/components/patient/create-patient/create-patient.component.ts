import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../service/patient.service';
import { Patient } from '../../../models/patient.model';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { AuthService } from '../../auth/auth.service';

// NG-ZORRO imports
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';


@Component({
  selector: 'app-create-patient',
  templateUrl: './create-patient.component.html',
  styleUrls: ['./create-patient.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardModule,
    NzRadioModule,
    AngularEditorModule,
    NzDividerModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzTypographyModule,
    NzIconModule
  ]
})
export class CreatePatientComponent implements OnInit {
  patientForm!: FormGroup;
  loading = false;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '150px',
    placeholder: 'Écrivez le rapport du patient ici...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    defaultFontSize: '3',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' }
    ],
    toolbarHiddenButtons: [
      ['undo', 'redo'],
      ['insertVideo']
    ],
    customClasses: [
      { name: 'quote', class: 'quote' },
      { name: 'redText', class: 'redText' }
    ]
  };

  dateFormat = 'dd/MM/yyyy';  // Format de date français

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientService: PatientService,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      nom: ['', Validators.required],
      cin: ['', Validators.required],
      email: ['', [Validators.email]],
      dateNaissance: ['', Validators.required],
      malade: [false],
      adresse: ['', Validators.required],
      codePostal: [''],
      numeroTelephone: ['', Validators.required],
      titre: [null, Validators.required],
      rapport: ['', Validators.required],
      dossierMedical: this.fb.group({
        allergies: [''],
        antecedents: [''],
        traitementsChroniques: ['']
      })
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.medecinId) {
      this.message.error("Impossible de récupérer l'ID du médecin");
      return;
    }

    const newPatient: Patient = {
      ...this.patientForm.value,
      medecinId: currentUser.medecinId
    };

    this.patientService.createPatient(newPatient).subscribe({
      next: () => {
        this.message.success('Patient créé avec son dossier médical.');
        this.router.navigate(['/doc/patients']);
      },
      error: () => {
        this.message.error('Erreur lors de la création du patient.');
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  onCancel(): void {
    this.router.navigate(['/doc/patients']);
  }

  clearReport(): void {
    this.patientForm.get('rapport')?.setValue('');
  }
}
