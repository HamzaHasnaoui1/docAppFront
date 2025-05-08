import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../service/patient.service';
import { Patient } from '../../../models/patient.model';
import {CommonModule, Location} from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Titre } from '../../../enums/titre.enum';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';
import {AngularEditorConfig, AngularEditorModule} from "@kolkov/angular-editor";

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html',
  standalone: true,
  styleUrl: './edit-patient.component.scss',
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
        AngularEditorModule
  ]
})
export class EditPatientComponent implements OnInit {
  patientForm!: FormGroup;
  patientId!: number;


  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '150px',
    placeholder: 'Écrivez le rapport du patient ici...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Times New Roman',
    defaultFontSize: '2',
    fonts: [
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'arial', name: 'Arial' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    toolbarHiddenButtons: [
      ['undo', 'redo'],
      ['insertVideo']
    ]
  };


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private message: NzMessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.patientId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadPatient();
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      nom: [''],
      cin: [''],
      email: [''],
      dateNaissance: [''],
      malade: [false],
      adresse: [''],
      codePostal: [''],
      numeroTelephone: [''],
      titre: [null],
      rapport: [''],
      dossierMedical: this.fb.group({
        allergies: [''],
        antecedents: [''],
        traitementsChroniques: ['']
      })
    });
  }

  loadPatient(): void {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient: Patient) => {
        this.patientForm.patchValue({
          nom: patient.nom,
          cin: patient.cin,
          email: patient.email,
          dateNaissance: patient.dateNaissance,
          malade: patient.malade,
          adresse: patient.adresse,
          codePostal: patient.codePostal,
          numeroTelephone: patient.numeroTelephone,
          titre: patient.titre,
          rapport: patient.rapport,
          dossierMedical: {
            allergies: patient.dossierMedical?.allergies ?? '',
            antecedents: patient.dossierMedical?.antecedents ?? '',
            traitementsChroniques: patient.dossierMedical?.traitementsChroniques ?? ''
          }
        });
      },
      error: () => this.message.error('Erreur lors du chargement du patient')
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      const updatedPatient: Patient = {
        id: this.patientId,
        ...this.patientForm.value
      };

      this.patientService.updatePatient(this.patientId, updatedPatient).subscribe({
        next: () => {
          this.message.success('Patient modifié avec succès');
          this.router.navigate(['/doc/patients/detail',this.patientId]);
        },
        error: () => this.message.error('Erreur lors de la modification')
      });
    }
  }


  onCancel(): void {
    if (this.patientId) {
      this.router.navigate(['/doc/patients/detail', this.patientId]);
    } else {
      this.location.back();
    }
  }


}
