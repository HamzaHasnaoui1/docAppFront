import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';
import {AngularEditorConfig, AngularEditorModule} from '@kolkov/angular-editor';
import {ActivatedRoute, Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ConsultationService} from '../../../service/consultation.service';
import {Consultation} from '../../../models/consultation.model';
import {NzDatePickerComponent} from 'ng-zorro-antd/date-picker';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-edit-consultation',
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
    AngularEditorModule,
    NzDatePickerComponent,
    NzInputNumberComponent
  ],
  templateUrl: './edit-consultation.component.html',
  standalone: true,
  styleUrl: './edit-consultation.component.scss'
})
export class EditConsultationComponent implements OnInit{
  consultationForm!:FormGroup;
  consultationId!:number;

constructor(
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private router: Router,
  private consultationService: ConsultationService,
  private message: NzMessageService
) {}

  ngOnInit() {
  this.consultationId= +this.route.snapshot.paramMap.get('id')!;
  this.initForm();
  this.loadConsultation();
  }

  formatPrix = (value: number): string => {
    return `${value} DH`;
  };

   initForm() {
    this.consultationForm = this.fb.group({
      dateConsultation: [''],
      rapport: [''],
      prix: [''],
      statusRDV: [''],
      rendezVous: this.fb.group({
        date: [''],
        patient: this.fb.group({
          nom: ['']
        })
      })
    })
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '150px',
    placeholder: 'Écrivez le rapport de la Consultation ici...',
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
   loadConsultation() {
    this.consultationService.getConsultationById(this.consultationId).subscribe( {
      next:(consultation: Consultation) => this.consultationForm.patchValue(consultation),
      error: ()=> this.message.error('Impossible de charger les données de cette consultation'),
    })
  }

  onSubmit(): void {
  if (this.consultationForm.invalid) {
    this.message.warning('Veuillez remplir tous les champs requis.');
    return;
  }
  const updateConsultation:Consultation={id:this.consultationId,...this.consultationForm.value};

  this.consultationService.updateConsultation(this.consultationId,updateConsultation).subscribe({
    next: () => {
      this.message.success('Consultation mis à jour avec succès.');
      this.router.navigate(['/doc/consultations']);
    },
    error: () => this.message.error('Erreur lors de la mise à jour de la Consultation.')
  });
  }

  onCancel():void{
  this.router.navigate(['/doc/consultations']);
  }
}
