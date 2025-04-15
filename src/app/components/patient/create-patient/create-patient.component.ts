import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
    NzRadioGroupComponent
  ]
})
export class CreatePatientComponent implements OnInit {
  patientForm!: FormGroup;
  titres = Object.values(Titre);

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
      dateNaissance: ['', Validators.required],
      malade: [false],
      adresse: [''],
      codePostal: [''],
      numeroTelephone: [''],
      titre: [null, Validators.required],
      rapport: ['']
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis.');
      return;
    }

    const newPatient: Patient = this.patientForm.value;

    this.patientService.createPatient(newPatient).subscribe({
      next: () => {
        this.message.success('Patient créé avec succès.');
        this.router.navigate(['/doc/patients']);
      },
      error: () => this.message.error('Erreur lors de la création du patient.')
    });

  }

  onCancel(): void {
    this.router.navigate(['/doc/patients']);
  }
}
