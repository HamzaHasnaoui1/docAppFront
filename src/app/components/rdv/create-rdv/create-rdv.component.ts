import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { RdvService } from '../../../service/rdv.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {CreateRendezVous} from '../../../models/CreateRendezVous';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import { NzI18nService, fr_FR } from 'ng-zorro-antd/i18n';
import localeFr from '@angular/common/locales/fr';
import { AuthService } from '../../../components/auth/auth.service';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-create-rdv',
  templateUrl: './create-rdv.component.html',
  styleUrls: ['./create-rdv.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzCardModule,
    NzStepsModule,
    NzDividerModule,
    NzIconModule,
    NzSpinModule,
    NzDescriptionsModule,
    FormsModule,
    NzInputNumberModule,
  ]
})
export class CreateRdvComponent implements OnInit {
  rdvForm: FormGroup;
  patients: Patient[] = [];
  medecins: Medecin[] = [];
  currentStep = 0;
  isLoading = false;
  availableTimes: string[] = [];
  medecinId: number | undefined;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rdvService: RdvService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private message: NzMessageService,
    private i18n: NzI18nService,
    private authService: AuthService
  ) {
    this.rdvForm = this.fb.group({
      date: [null, Validators.required],
      time: [null, Validators.required],
      duration: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      patientId: [null, Validators.required],
      medecinId: [null, Validators.required],
      rapport: [''],
      prix: [null, [Validators.required, Validators.min(0)]]
    });

    // Configuration de la locale française pour ng-zorro
    this.i18n.setLocale(fr_FR);
    // Configuration de la locale française pour Angular
    registerLocaleData(localeFr);

    // Surveiller les changements de valeur pour l'ID du médecin et du patient
    this.rdvForm.get('medecinId')?.valueChanges.subscribe(value => {
      if (value && this.currentStep === 0) {
        setTimeout(() => this.nextStep(), 500);
      }
    });

    this.rdvForm.get('patientId')?.valueChanges.subscribe(value => {
      if (value && this.currentStep === 1) {
        setTimeout(() => this.nextStep(), 500);
      }
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    this.medecinId = currentUser?.id ? Number(currentUser.id) : undefined;

    this.loadPatients();
    this.loadMedecins();
    this.generateAvailableTimes();
  }

  loadPatients(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.medecinId) {
      this.error = "Impossible de récupérer l'ID du médecin";
      return;
    }

    this.patientService.getPatients(0, '', 50, currentUser.medecinId)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des patients:', error);
          this.error = "Erreur lors du chargement des patients";
          return [];
        })
      )
      .subscribe(response => {
        this.patients = response.patients;
      });
  }

  loadMedecins(): void {
    this.medecinService.getMedecins(0)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des médecins:', error);
          this.error = "Erreur lors du chargement des médecins";
          return [];
        })
      )
      .subscribe(response => {
        this.medecins = response.medecins;
      });
  }

  generateAvailableTimes(): void {
    // Génération des créneaux horaires de 8h à 18h par pas de 30 minutes
    this.availableTimes = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.availableTimes.push(time);
      }
    }
  }

  calculateEndTime(startTime: string, duration: number): string {
    if (!startTime || !duration) return '';

    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  nextStep(): void {
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  onSubmit(): void {
    if (this.rdvForm.invalid) {
      this.rdvForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const formValue = this.rdvForm.value;
    const startTime = formValue.time;
    const duration = formValue.duration;
    const endTime = this.calculateEndTime(startTime, duration);

    const newRdv: CreateRendezVous = {
      date: `${format(formValue.date, 'yyyy-MM-dd')}T${startTime}:00`,
      dateFin: `${format(formValue.date, 'yyyy-MM-dd')}T${endTime}:00`,
      statusRDV: 'PENDING',
      patient: { id: formValue.patientId },
      medecin: { id: formValue.medecinId },
      rapport: formValue.rapport,
      prix: formValue.prix
    };

    this.rdvService.createRdv(newRdv)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création du rendez-vous:', error);
          this.error = error.error?.message || "Erreur lors de la création du rendez-vous";
          this.loading = false;
          return [];
        })
      )
      .subscribe(response => {
        this.success = "Rendez-vous créé avec succès";
        this.loading = false;
        this.rdvForm.reset();
        setTimeout(() => {
          this.router.navigate(['/rdv/list']);
        }, 2000);
      });
  }

  getSelectedPatient(): Patient | undefined {
    const patientId = this.rdvForm.get('patientId')?.value;
    return this.patients.find(p => p.id === patientId);
  }

  getSelectedMedecin(): Medecin | undefined {
    const medecinId = this.rdvForm.get('medecinId')?.value;
    return this.medecins.find(m => m.id === medecinId);
  }
}

