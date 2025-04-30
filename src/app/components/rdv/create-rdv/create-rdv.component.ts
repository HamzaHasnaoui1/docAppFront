import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../service/patient.service';
import { MedecinService } from '../../../service/medecin.service';
import { Patient } from '../../../models/patient.model';
import { Medecin } from '../../../models/medecin.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { RdvService } from '../../../service/rdv.service';
import { RendezVous } from '../../../models/rdv.model';

@Component({
  selector: 'app-create-rdv',
  templateUrl: './create-rdv.component.html',
  styleUrl: './create-rdv.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCardComponent,
    ReactiveFormsModule,
  ]
})
export class CreateRdvComponent implements OnInit {
  rdvForm!: FormGroup;
  patients: Patient[] = [];
  medecins: Medecin[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rdvService: RdvService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();
    this.loadMedecins();
  }

  initForm(): void {
    this.rdvForm = this.fb.group({
      date: ['', Validators.required],
      patientId: ['', Validators.required],
      medecinId: ['', Validators.required],
      rapport: [''],
      prix: ['']
    });
  }

  loadPatients(): void {
    this.patientService.getPatients(0).subscribe({
      next: (res) => {
        console.log('Patients:', res);
        this.patients = res.patients;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.message.error('Erreur lors du chargement des patients.');
      }
    });
  }

  loadMedecins(): void {
    this.medecinService.getMedecins(0).subscribe({
      next: (res) => {
        console.log('Médecins:', res);
        this.medecins = res.medecins;
      },
      error: (err) => {
        console.error('Erreur chargement médecins:', err);
        this.message.error('Erreur lors du chargement des médecins.');
      }
    });
  }

  onSubmit(): void {
    if (this.rdvForm.invalid) {
      this.rdvForm.markAllAsTouched();
      return;
    }

    const newRdv: RendezVous = {
      ...this.rdvForm.value,
      patient: { id: this.rdvForm.value.patientId },
      medecin: { id: this.rdvForm.value.medecinId }
    };

    this.rdvService.createRdv(newRdv).subscribe({
      next: () => {
        this.message.success('Rendez-vous créé avec succès.');
        this.router.navigate(['/doc/rdv/list']);
      },
      error: err => {
        this.message.error(err?.error?.message || 'Erreur lors de la création du rendez-vous.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/doc/rdv/list']);
  }
}
