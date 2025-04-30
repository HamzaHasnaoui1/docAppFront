import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RdvService } from '../../../service/rdv.service';
import { Medecin } from '../../../models/medecin.model';
import { RendezVous } from '../../../models/rdv.model';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-edit-rdv',
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
    NzIconDirective
  ],
  templateUrl: './edit-rdvD.component.html',
  standalone: true,
  styleUrl: './edit-rdvD.component.scss'
})
export class EditRdvDComponent implements OnInit {
  rdvForm!: FormGroup;
  rdvId!: number;

  constructor(
    private rdvService: RdvService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.rdvId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadRdv();
  }

  initForm(): void {
    this.rdvForm = this.fb.group({
      id: [null],
      date: ['', Validators.required],
      statusRDV: ['PENDING', Validators.required],
      patient: this.fb.group({
        id: [''],
        nom: [''],
        dateNaissance: ['']
      }),
      medecin: this.fb.group({
        id: [''],
        nom: [''],
        specialite: ['']
      }),
    });
  }

  loadRdv(): void {
    this.rdvService.getRdvById(this.rdvId).subscribe({
      next: (rdv: RendezVous) => {
        if (!this.rdvForm) {
          this.initForm();
        }

        // Patch des valeurs principales
        this.rdvForm.patchValue({
          id: rdv.id,
          date: rdv.date,
          statusRDV: rdv.statusRDV,
        });

        // Patch des informations patient
        if (rdv.patient) {
          (this.rdvForm.get('patient') as FormGroup).patchValue({
            id: rdv.patient.id,
            nom: rdv.patient.nom,
            dateNaissance: rdv.patient.dateNaissance
          });
        }

        // Patch des informations médecin
        if (rdv.medecin) {
          (this.rdvForm.get('medecin') as FormGroup).patchValue({
            id: rdv.medecin.id,
            nom: rdv.medecin.nom,
            specialite: rdv.medecin.specialite
          });
        }
      },
      error: () => this.message.error('Impossible de charger les données du RDV.')
    });
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.rdvForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis.');
      return;
    }

    const updatedRdv: RendezVous = {
      id: this.rdvId,
      ...this.rdvForm.value,
      patientId: this.rdvForm.value.patient.id,
      medecinId: this.rdvForm.value.medecin.id
    };

    this.rdvService.updateRdv(this.rdvId, updatedRdv).subscribe({
      next: () => {
        this.message.success('RDV mis à jour avec succès.');
        this.router.navigate(['doc/rdv/list']);
      },
      error: () => this.message.error('Erreur lors de la mise à jour du RDV.')
    });
  }

  onCancel(): void {
    this.router.navigate(['doc/rdv/list']);
  }
}
