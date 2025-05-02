import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../service/patient.service';
import { Patient } from '../../../models/patient.model';
import { Titre } from '../../../enums/titre.enum';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { NzMessageService } from 'ng-zorro-antd/message';
import {AngularEditorConfig, AngularEditorModule} from '@kolkov/angular-editor';
import {NzDividerComponent} from 'ng-zorro-antd/divider';

;

@Component({
  selector: 'app-create-patient',
  templateUrl: './create-patient.component.html',
  styleUrl: './create-patient.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
    AngularEditorModule,
    FormsModule,
    NzDividerComponent,
  ]
})
export class CreatePatientComponent implements OnInit {
  patientForm!: FormGroup;

editorConfig: AngularEditorConfig = {
  editable: true,
  spellcheck: true,
  height: '200px',
  minHeight: '150px',
  placeholder: 'Écrivez le rapport du patient ici...',
  translate: 'no',
  defaultParagraphSeparator: 'p',
  defaultFontName: 'Times New Roman',
  defaultFontSize: '2',
  fonts: [
    { class: 'times-new-roman', name: 'Times New Roman' },
    { class: 'arial', name: 'Arial' },
    { class: 'calibri', name: 'Calibri' },
    { class: 'comic-sans-ms', name: 'Comic Sans MS' }
  ],
  toolbarHiddenButtons: [
    ['undo', 'redo'],
    ['insertVideo']
  ]
};

constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientService: PatientService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      nom: ['', Validators.required],
      cin: ['', Validators.required],
      email: [''],
      dateNaissance: ['', Validators.required],
      malade: [false],
      adresse: ['',Validators.required],
      codePostal: [''],
      numeroTelephone: ['', Validators.required],
      titre: [null, Validators.required],
      rapport: ['',Validators.required],
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

    const newPatient: Patient = this.patientForm.value;

    this.patientService.createPatient(newPatient).subscribe({
      next: () => {
        this.message.success('Patient créé avec son dossier médical.');
        this.router.navigate(['/doc/patients']);
      },
      error: () => this.message.error('Erreur lors de la création du patient.'),
    });
  }

  onCancel(): void {
    this.router.navigate(['/doc/patients']);
  }

  clearReport() {
    this.patientForm.get('rapport')?.setValue('');
  }
}
