import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MedicamentService } from '../../../service/medicament.service';
import {Medicament} from '../../../models/Medicament.model';

@Component({
  selector: 'app-edit-medicament',
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
  ],
  templateUrl: './edit-medicament.component.html',
  styleUrl: './edit-medicament.component.scss'
})
export class EditMedicamentComponent implements OnInit {
  medicamentForm!: FormGroup;
  medicamentId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private medicamentService: MedicamentService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.medicamentId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadMedicament();
  }

  initForm(): void {
    this.medicamentForm = this.fb.group({
      nom: [''],
      description: [''],
      categorie: [''],
      fabricant: [''],
      dosageStandard: [''],
      actif: [true]
    });
  }

  loadMedicament(): void {
    this.medicamentService.getMedicamentById(this.medicamentId).subscribe({
      next: (medicament: Medicament) => this.medicamentForm.patchValue(medicament),
      error: () => this.message.error('Erreur lors du chargement du médicament.')
    });
  }

  onSubmit(): void {
    if (this.medicamentForm.invalid) {
      this.message.warning('Veuillez remplir les champs requis.');
      return;
    }

    const updatedMedicament: Medicament = {
      id: this.medicamentId,
      ...this.medicamentForm.value
    };

    this.medicamentService.updateMedicament(this.medicamentId, updatedMedicament).subscribe({
      next: () => {
        this.message.success('Médicament mis à jour avec succès.');
        this.router.navigate(['/doc/medicament']);
      },
      error: () => this.message.error('Échec de la mise à jour du médicament.')
    });
  }

  onCancel(): void {
  if (window.history.length > 1) {
    this.location.back();
  } else {
    this.router.navigate(['/doc/medicament']);
  }
}

}
