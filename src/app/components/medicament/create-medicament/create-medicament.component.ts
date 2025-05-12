import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import {MedicamentService} from '../../../service/medicament.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzSwitchComponent} from 'ng-zorro-antd/switch';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-create-medicament',
  templateUrl: './create-medicament.component.html',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzFormItemComponent,
    NzFormControlComponent,
    NzFormLabelComponent,
    NzColDirective,
    NzSwitchComponent,
    ReactiveFormsModule,
    NzInputDirective,
    NzRowDirective,
    NzCardComponent,
    NzFormDirective,
    NzIconDirective
  ],
  styleUrls: ['./create-medicament.component.scss']
})
export class CreateMedicamentComponent implements OnInit {
  medicamentForm!: FormGroup;
  file: File | null = null;

  constructor(
    private fb: FormBuilder,
    private medicamentService: MedicamentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.medicamentForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: [''],
      categorie: [''],
      fabricant: [''],
      dosageStandard: [''],
      actif: [true]
    });
  }

  // Fonction pour soumettre le formulaire
  onSubmit(): void {
    if (this.medicamentForm.valid) {
      const medicamentData = this.medicamentForm.value;
      this.medicamentService.createMedicament(medicamentData).subscribe(() => {
        this.router.navigate(['/medicaments']).then(() => {
          // On met à jour localement après création
        });
      });
    }
  }

  // Fonction pour annuler la création et revenir à la liste des médicaments
  onCancel(): void {
    this.router.navigate(['/doc/medicament']);
  }

  // Fonction pour télécharger un échantillon Excel
  downloadSampleExcel(): void {
    const ws = XLSX.utils.json_to_sheet([
      { nom: 'Exemple Médicament 1', description: 'Description', categorie: 'Catégorie', fabricant: 'Fabricant', dosageStandard: '500mg', actif: true },
      { nom: 'Exemple Médicament 2', description: 'Description', categorie: 'Catégorie', fabricant: 'Fabricant', dosageStandard: '200mg', actif: false }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SampleMedicaments');
    XLSX.writeFile(wb, 'sample_medicaments.xlsx');
  }

  // Fonction pour importer des médicaments depuis un fichier Excel
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

        // Traitez ici les données pour les insérer dans le backend ou faire ce que vous voulez
        console.log(data); // Affiche les données du fichier CSV
      };
    }
  }
}
