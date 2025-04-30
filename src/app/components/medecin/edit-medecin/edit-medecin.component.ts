import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';
import {MedecinService} from '../../../service/medecin.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Medecin} from '../../../models/medecin.model';
import {Patient} from '../../../models/patient.model';

@Component({
  selector: 'app-edit-medecin',
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
  templateUrl: './edit-medecin.component.html',
  standalone: true,
  styleUrl: './edit-medecin.component.scss'
})
export class EditMedecinComponent implements OnInit{
medecinForm!:FormGroup;
medecinId!:number;

constructor(
  private medecinService:MedecinService,
  private router:Router,
  private fb:FormBuilder,
  private route:ActivatedRoute,
  private message: NzMessageService
) {}

  ngOnInit(){
    this.medecinId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadMedecin();
}

  initForm(): void {
    this.medecinForm = this.fb.group({
      nom: [''],
      email: [''],
      specialite: [''],
      numeroTelephone: ['']
    });
  }

  loadMedecin(): void {
  this.medecinService.getMedecinById(this.medecinId).subscribe({
    next:(medecin:Medecin)=>this.medecinForm.patchValue(medecin),
    error: () => this.message.error('Impossible de charger les données du medecin.')
  })
  }


  onSubmit(): void {
    if (this.medecinForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis.');
      return;
    }

    const updatedMedecin: Medecin = { id: this.medecinId, ...this.medecinForm.value };

    this.medecinService.updateMedecin(this.medecinId, updatedMedecin).subscribe({
      next: () => {
        this.message.success('Medecin mis à jour avec succès.');
        this.router.navigate(['/doc/medecin']);
      },
      error: () => this.message.error('Erreur lors de la mise à jour du Medecin.')
    });
  }

  onCancel(): void {
    this.router.navigate(['/doc/medecin']);
  }
}
