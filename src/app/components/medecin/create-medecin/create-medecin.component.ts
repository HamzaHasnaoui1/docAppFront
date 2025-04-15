import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';
import {Router} from '@angular/router';
import {PatientService} from '../../../service/patient.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MedecinService} from '../../../service/medecin.service';
import {Patient} from '../../../models/patient.model';
import {Medecin} from '../../../models/medecin.model';

@Component({
  selector: 'app-create-medecin',
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
  templateUrl: './create-medecin.component.html',
  standalone: true,
  styleUrl: './create-medecin.component.scss'
})
export class CreateMedecinComponent implements OnInit{
medecinForm!:FormGroup;

constructor(private fb: FormBuilder,
            private router: Router,
            private medecinService: MedecinService,
            private message: NzMessageService,
            ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.medecinForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      specialite: ['', Validators.required],
      numeroTelephone: ['', Validators.required]
    });
  }


  onSubmit(): void {
    if (this.medecinForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis.');
      return;
    }

    const newMedecin: Medecin = this.medecinForm.value;

    this.medecinService.createMedecin(newMedecin).subscribe({
      next: () => {
        this.message.success('Medecin créé avec succès.');
        this.router.navigate(['/doc/medecin']);
      },
      error: () => this.message.error('Erreur lors de la création du medecin.')
    });

  }

  onCancel(): void {
    this.router.navigate(['/doc/medecin']);
  }

}
