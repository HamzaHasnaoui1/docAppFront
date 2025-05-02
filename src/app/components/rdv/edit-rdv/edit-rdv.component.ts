import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RdvService } from '../../../service/rdv.service';
import { RendezVous } from '../../../models/rdv.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NzFormDirective,
  NzFormItemComponent,
  NzFormLabelComponent,
  NzFormModule,
  NzFormTextComponent
} from 'ng-zorro-antd/form';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';
import {NzSwitchComponent} from 'ng-zorro-antd/switch';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzDatePickerComponent} from 'ng-zorro-antd/date-picker';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {CommonModule} from '@angular/common';
import {Patient} from '../../../models/patient.model';
import {id} from 'date-fns/locale';

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

  initForm() {
    this.rdvForm = this.fb.group({
      date: ['', Validators.required],
      statusRDV: ['PENDING', Validators.required],
      medecin: [{value: '', disabled: true}, Validators.required],
      patient: [{value: '', disabled: true}, Validators.required],
      rapport: [''],
      prix: [0, [Validators.min(0)]],
      ordonnance: this.fb.group({
        contenu: [''],
        remarques: [''],
        dateEmission: [null],
        archivee: [false],
        medicaments: this.fb.array([])
      })
    });
  }

  get medicaments(): FormArray {
    return this.rdvForm.get('ordonnance.medicaments') as FormArray;
  }

  addMedicament(nom: string = '', posologie: string = '') {
    this.medicaments.push(this.fb.group({
      nom: [nom, Validators.required],
      posologie: [posologie, Validators.required]
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
        this.medecin = rdv.medecin?.nom || rdv.medecin?.nom || 'Médecin inconnu';
        this.patient = rdv.patient?.nom || rdv.patient?.nom || 'Patient inconnu';

        this.rdvForm.patchValue({
          date: rdv.date,
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

          if (rdv.ordonnance.medicamentsPrescrits) {
            this.medicaments.clear();
            rdv.ordonnance.medicamentsPrescrits.forEach((med, index) => {
              this.addMedicament(
                med,
                rdv.ordonnance?.posologies?.[med] || ''
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

    const formValue = this.rdvForm.getRawValue(); // Utilisez getRawValue() pour inclure les champs désactivés
    const medicamentsPrescrits = formValue.ordonnance.medicaments.map((m: any) => m.nom);
    const posologies = formValue.ordonnance.medicaments.reduce((acc: any, curr: any) => {
      if (curr.nom) acc[curr.nom] = curr.posologie;
      return acc;
    }, {});

    const rdv: RendezVous = {
      id: this.rdvId,
      ...formValue,
      medecin: { id: formValue.medecin } as any,
      patient: { id: formValue.patient } as any,
      ordonnance: {
        ...formValue.ordonnance,
        medicamentsPrescrits,
        posologies,
        medicaments: undefined
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
