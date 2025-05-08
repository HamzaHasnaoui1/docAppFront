import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';

import { RdvService } from '../../../service/rdv.service';
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
    NzIconDirective
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

  constructor(
    private fb: FormBuilder,
    private rdvService: RdvService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.rdvId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadRdv();
  }

  formatDateTimeLocal(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  initForm() {
    this.rdvForm = this.fb.group({
      date: [null, Validators.required],
      statusRDV: ['PENDING', Validators.required],
      medecin: [null, Validators.required],
      patient: [null, Validators.required],
      prix: [0],
      archivee: [false],
      rapport: [''],
      ordonnance: this.fb.group({
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
      medicament: [medicament, Validators.required],
      posologie: [posologie, Validators.required],
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
            contenu: rdv.ordonnance.contenu ?? '',
            remarques: rdv.ordonnance.remarques ?? '',
            dateEmission: rdv.ordonnance.dateEmission?.substring(0, 10) ?? '',
            archivee: rdv.ordonnance.archivee ?? false
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

  onSubmit() {
    if (this.rdvForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis');
      return;
    }

    const formValue = this.rdvForm.getRawValue();

    const rdv: RendezVous = {
      id: this.rdvId,
      date: formValue.date,
      dateFin: formValue.date,
      statusRDV: formValue.statusRDV,
      medecin: { id: formValue.medecin } as any,
      patient: { id: formValue.patient } as any,
      rapport: formValue.rapport,
      prix: formValue.prix,
      ordonnance: {
        contenu: formValue.ordonnance.contenu,
        remarques: formValue.ordonnance.remarques,
        dateEmission: formValue.ordonnance.dateEmission,
        archivee: formValue.ordonnance.archivee,
        medicaments: formValue.ordonnance.medicaments.map((m: any) => ({
          medicament: m.medicament,
          posologie: m.posologie,
          duree: m.duree,
          frequence: m.frequence,
          instructions: m.instructions
        }))
      }
    };

    this.rdvService.updateRdv(this.rdvId, rdv).subscribe({
      next: () => {
        this.message.success('Rendez-vous mis à jour avec succès');
        this.router.navigate(['/doc/patients/detail', this.patientId]);
      },
      error: (err) => {
        console.error('Erreur de mise à jour :', err);
        this.message.error('Erreur lors de la mise à jour du rendez-vous');
      }
    });
  }

  onCancel(): void {
    if (this.patientId) {
      this.router.navigate(['/doc/patients/detail', this.patientId]);
    } else {
      this.message.warning('ID patient non disponible');
    }
  }
}
