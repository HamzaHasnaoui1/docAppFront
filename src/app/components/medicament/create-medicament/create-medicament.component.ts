import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MedicamentService } from '../../../service/medicament.service';
import { Medicament } from '../../../models/Medicament.model';
import { AuthService } from '../../../components/auth/auth.service';
import * as XLSX from 'xlsx';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-create-medicament',
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
    NzRadioGroupComponent,
    NzIconDirective
  ],
  templateUrl: './create-medicament.component.html',
  styleUrl: './create-medicament.component.scss'
})
export class CreateMedicamentComponent implements OnInit {
  medicamentForm!: FormGroup;
  file: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private medicamentService: MedicamentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.medicamentForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      categorie: [''],
      fabricant: [''],
      dosageStandard: [''],
      actif: [true]
    });
  }

  onSubmit(): void {
    if (this.medicamentForm.invalid) {
      this.medicamentForm.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.medecinId) {
      this.message.error("Impossible de récupérer l'ID du médecin");
      return;
    }

    const newMedicament: Medicament = {
      ...this.medicamentForm.value,
      medecinId: currentUser.medecinId
    };

    this.medicamentService.createMedicament(newMedicament).subscribe({
      next: () => {
        this.message.success('Médicament créé avec succès');
        this.router.navigate(['/doc/medicament/list']);
      },
      error: () => this.message.error('Erreur lors de la création du médicament')
    });
  }

  onCancel(): void {
    this.router.navigate(['/doc/medicament/list']);
  }

  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet([
      { nom: 'Exemple Médicament 1', description: 'Description', categorie: 'Catégorie', fabricant: 'Fabricant', dosageStandard: '500mg', actif: true },
      { nom: 'Exemple Médicament 2', description: 'Description', categorie: 'Catégorie', fabricant: 'Fabricant', dosageStandard: '200mg', actif: false }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SampleMedicaments');
    XLSX.writeFile(wb, 'sample_medicaments.xlsx');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = () => {
        const binaryString = reader.result as string;
        const wb = XLSX.read(binaryString, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        console.log(data);
      };
    }
  }
}
