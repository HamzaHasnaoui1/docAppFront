import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NzFormDirective, NzFormItemComponent, NzFormLabelComponent,
  NzFormModule, NzFormTextComponent
} from 'ng-zorro-antd/form';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import {NzAutosizeDirective, NzInputDirective} from 'ng-zorro-antd/input';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';

import { RdvService } from '../../../service/rdv.service';
import { MedicamentService } from '../../../service/medicament.service';
import { RendezVous } from '../../../models/rdv.model';
import { Medicament } from '../../../models/Medicament.model';
import { OrdonnanceMedicament } from '../../../models/OrdonnanceMedicament.model';

@Component({
  selector: 'app-edit-rdv',
  templateUrl: './edit-rdv.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzFormTextComponent,
    NzColDirective,
    NzFormItemComponent,
    NzRowDirective,
    NzCardComponent,
    NzFormDirective,
    NzFormLabelComponent,
    NzOptionComponent,
    NzSelectComponent,
    NzInputNumberComponent,
    NzSwitchComponent,
    NzInputDirective,
    NzDatePickerComponent,
    NzButtonComponent,
    NzIconDirective,
    NzSpinComponent,
    NzAutosizeDirective
  ],
  styleUrls: ['./edit-rdv.component.scss']
})
export class EditRdvComponent implements OnInit {
  patientId!: number;
  rdvForm!: FormGroup;
  loading = false;
  rdvId!: number;
  medecin: string = '';
  patient: string = '';
  originalRdv!: RendezVous;

  // Médicaments search
  medicamentsList: Medicament[] = [];
  isLoadingMeds = false;
  medicamentSearchTerm$ = new Subject<string>();
  nzFilterOption = () => true;

  constructor(
    private fb: FormBuilder,
    private rdvService: RdvService,
    private medicamentService: MedicamentService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.rdvId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadRdv();
    this.setupMedicamentSearch();
    this.loadInitialMedicaments();
  }

  formatDateTimeLocal(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  initForm() {
    this.rdvForm = this.fb.group({
      date: [null],
      statusRDV: ['PENDING'],
      medecin: [null],
      patient: [null],
      prix: [0],
      rapport: [''],
      ordonnance: this.fb.group({
        id: [null],
        contenu: [''],
        remarques: [''],
        medicaments: this.fb.array([])
      })
    });
  }

  get medicaments(): FormArray {
    return this.rdvForm.get('ordonnance.medicaments') as FormArray;
  }

  addMedicament(medicament?: Medicament, posologie: string = '', duree: string = '', frequence: string = '', instructions: string = '') {
    this.medicaments.push(this.fb.group({
      id: [null], // Pour les médicaments existants
      medicamentId: [medicament?.id || null],
      medicamentNom: [medicament?.nom || ''],
      posologie: [posologie],
      duree: [duree],
      frequence: [frequence],
      instructions: [instructions]
    }));
  }

  removeMedicament(index: number) {
    this.medicaments.removeAt(index);
  }

  loadRdv() {
    this.loading = true;
    this.rdvService.getRdvById(this.rdvId).subscribe({
      next: (rdv: RendezVous) => {
        this.originalRdv = rdv;
        this.patientId = rdv.patient?.id;
        this.medecin = rdv.medecin?.nom || 'Médecin inconnu';
        this.patient = rdv.patient?.nom || 'Patient inconnu';

        this.rdvForm.patchValue({
          date: this.formatDateTimeLocal(rdv.date),
          statusRDV: rdv.statusRDV,
          medecin: rdv.medecin?.id,
          patient: rdv.patient?.id,
          rapport: rdv.rapport,
          prix: rdv.prix
        });

        if (rdv.ordonnance) {
          this.rdvForm.get('ordonnance')?.patchValue({
            id: rdv.ordonnance.id,
            contenu: rdv.ordonnance.contenu ?? '',
            remarques: rdv.ordonnance.remarques ?? ''
          });

          if (rdv.ordonnance.medicaments) {
            this.medicaments.clear();
            rdv.ordonnance.medicaments.forEach((med: OrdonnanceMedicament) => {
              this.addMedicament(
                med.medicament,
                med.posologie,
                med.duree,
                med.frequence,
                med.instructions
              );
            });
          }
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('Erreur lors du chargement du rendez-vous');
      }
    });
  }

  setupMedicamentSearch() {
    this.medicamentSearchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword => {
        this.isLoadingMeds = true;
        return this.medicamentService.getMedicaments(0, keyword, 10).pipe(
          switchMap(response => {
            this.isLoadingMeds = false;
            return of(response.medicaments || []);
          })
        );
      })
    ).subscribe(medicaments => {
      this.medicamentsList = medicaments;
    });
  }

  loadInitialMedicaments() {
    this.isLoadingMeds = true;
    this.medicamentService.getMedicaments(0, '', 10).subscribe({
      next: (response) => {
        this.medicamentsList = response.medicaments || [];
        this.isLoadingMeds = false;
      },
      error: () => {
        this.isLoadingMeds = false;
        this.message.error('Erreur lors du chargement des médicaments');
      }
    });
  }

  onSearchMedicament(keyword: string) {
    this.medicamentSearchTerm$.next(keyword);
  }

  compareFn = (o1: any, o2: any) => {
    if (o1 && o2) {
      return o1.id === o2.id;
    }
    return false;
  };

  onSubmit() {
    if (this.rdvForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading = true;
    const formValue = this.rdvForm.getRawValue();

    // Préparation des données avec une structure simplifiée
    const payload = {
      id: this.rdvId,
      date: formValue.date,
      dateFin: this.originalRdv.dateFin || formValue.date,
      statusRDV: formValue.statusRDV,
      rapport: formValue.rapport,
      prix: formValue.prix,
      medecinId: formValue.medecin,  // Juste l'ID
      patientId: formValue.patient,   // Juste l'ID
      ordonnance: formValue.ordonnance.id ? {
        id: formValue.ordonnance.id,
        contenu: formValue.ordonnance.contenu,
        remarques: formValue.ordonnance.remarques,
        medicaments: formValue.ordonnance.medicaments.map((m: any) => ({
          id: m.id || undefined,
          medicamentId: m.medicamentId,
          posologie: m.posologie,
          duree: m.duree,
          frequence: m.frequence,
          instructions: m.instructions
        }))
      } : {
        contenu: formValue.ordonnance.contenu,
        remarques: formValue.ordonnance.remarques,
        medicaments: formValue.ordonnance.medicaments.map((m: any) => ({
          medicamentId: m.medicamentId,
          posologie: m.posologie,
          duree: m.duree,
          frequence: m.frequence,
          instructions: m.instructions
        }))
      }
    };

    console.log('Payload envoyé:', JSON.stringify(payload, null, 2));

    this.rdvService.updateRdv(this.rdvId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.message.success('Rendez-vous mis à jour avec succès');
        this.router.navigate(['/doc/patients/detail', this.patientId]);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur complète:', err);
        this.message.error(`Échec de la mise à jour: ${err.error?.message || err.message}`);
      }
    });
  }  onCancel(): void {
    if (this.patientId) {
      this.router.navigate(['/doc/patients/detail', this.patientId]);
    } else {
      this.message.warning('ID patient non disponible');
    }
  }
}
