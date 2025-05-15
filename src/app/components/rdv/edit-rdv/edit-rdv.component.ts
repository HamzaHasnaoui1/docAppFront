import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RdvService } from '../../../service/rdv.service';
import { MedicamentService } from '../../../service/medicament.service';
import { DonneesPhysiologiquesService } from '../../../service/donnees-physiologiques.service';
import {OrdonnanceMedicamentDTO, OrdonnanceMedicamentService} from '../../../service/ordonnance-medicament.service';
import { RendezVous } from '../../../models/rdv.model';
import { Medicament } from '../../../models/Medicament.model';
import { OrdonnanceMedicament } from '../../../models/OrdonnanceMedicament.model';
import { DonneesPhysiologiques } from '../../../models/DonneesPhysiologiques.model';
import { NzFormItemComponent, NzFormLabelComponent, NzFormTextComponent } from 'ng-zorro-antd/form';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import { NzAutosizeDirective, NzInputDirective } from 'ng-zorro-antd/input';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-rdv',
  templateUrl: './edit-rdv.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NzFormLabelComponent,
    NzFormItemComponent,
    NzFormTextComponent,
    NzCardComponent,
    NzTabSetComponent,
    NzTabComponent,
    NzRowDirective,
    NzColDirective,
    NzSelectComponent,
    NzOptionComponent,
    NzInputNumberComponent,
    NzInputDirective,
    NzAutosizeDirective,
    NzEmptyComponent,
    NzButtonComponent,
    NzIconDirective
  ],
  styleUrls: ['./edit-rdv.component.scss']
})
export class EditRdvComponent implements OnInit {
  rdvForm!: FormGroup;
  medicalDataForm!: FormGroup;
  loading = false;
  rdvId!: number;
  patientId!: number;
  medecin: string = '';
  patient: string = '';
  activeTab = 0;

  medicamentsList: Medicament[] = [];
  isLoadingMeds = false;
  medicamentSearchTerm$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private rdvService: RdvService,
    private medicamentService: MedicamentService,
    private donneesPhysioService: DonneesPhysiologiquesService,
    private ordonnanceMedicamentService: OrdonnanceMedicamentService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.rdvId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForms();
    this.loadRdv();
    this.setupMedicamentSearch();
    this.setupIMCCalculation();
  }

  private setupIMCCalculation(): void {
    this.medicalDataForm.get('poids')?.valueChanges.subscribe(() => {
      const imc = this.calculateIMC();
      this.medicalDataForm.patchValue({ imc }, { emitEvent: false });
    });

    this.medicalDataForm.get('taille')?.valueChanges.subscribe(() => {
      const imc = this.calculateIMC();
      this.medicalDataForm.patchValue({ imc }, { emitEvent: false });
    });
  }

  initForms(): void {
    this.rdvForm = this.fb.group({
      date: [null],
      statusRDV: ['PENDING'],
      medecin: [null],
      patient: [null],
      prix: [0, [ Validators.min(0)]],
      rapport: [''],
      ordonnance: this.fb.group({
        id: [null],
        contenu: [''],
        remarques: [''],
        medicaments: this.fb.array([])
      })
    });

    this.medicalDataForm = this.fb.group({
      poids: [null, [Validators.min(0)]],
      taille: [null, [Validators.min(0)]],
      tensionSystolique: [null, [Validators.min(0)]],
      tensionDiastolica: [null, [Validators.min(0)]],
      frequenceCardiaque: [null, [Validators.min(0)]],
      temperature: [null, [Validators.min(0)]],
      glycemie: [null, [Validators.min(0)]],
      oeilDroit: [''],
      oeilGauche: [''],
      remarques: [''],
      imc: [null]
    });
  }

  get medicaments(): FormArray {
    return this.rdvForm.get('ordonnance.medicaments') as FormArray;
  }

  addMedicament(medicament?: Medicament, posologie: string = '', duree: string = '', frequence: string = '', instructions: string = ''): void {
    this.medicaments.push(this.fb.group({
      id: [null],
      medicamentId: [medicament?.id || null],
      medicamentNom: [medicament?.nom || ''],
      posologie: [posologie],
      duree: [duree],
      frequence: [frequence],
      instructions: [instructions]
    }));
  }

  removeMedicament(index: number): void {
    const medicamentGroup = this.medicaments.at(index);
    const medicamentId = medicamentGroup.get('id')?.value;

    if (medicamentId) {
      this.loading = true;
      this.ordonnanceMedicamentService.deleteMedicament(medicamentId).subscribe({
        next: () => {
          this.medicaments.removeAt(index);
          this.message.success('Médicament supprimé avec succès');
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.message.error(`Erreur lors de la suppression: ${err.message}`);
        }
      });
    } else {
      this.medicaments.removeAt(index);
    }
  }

  loadRdv(): void {
    this.loading = true;
    this.rdvService.getRdvById(this.rdvId).pipe(
      switchMap((rdv: RendezVous) => {
        this.patientId = rdv.patient?.id || 0;
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
            id: rdv.ordonnance.id,
            contenu: rdv.ordonnance.contenu ?? '',
            remarques: rdv.ordonnance.remarques ?? ''
          });

          const ordonnanceId = rdv.ordonnance.id;
          if (ordonnanceId != null) {
            return this.ordonnanceMedicamentService.getMedicamentsByOrdonnance(ordonnanceId);
          } else {
            return of([]);
          }
        } else {
          return of([]);
        }
      }),
      switchMap((medicaments: OrdonnanceMedicamentDTO[]) => {
        if (medicaments.length > 0) {
          this.medicaments.clear();
          medicaments.forEach(med => {
            this.addMedicament(
              { id: med.medicamentId, nom: '' },
              med.dosage,
              med.duree,
              med.frequence,
              ''
            );
          });

          return forkJoin(
            medicaments.map(med =>
              this.medicamentService.getMedicamentById(med.medicamentId).pipe(
                catchError(() => of(null))
              )
            )
          );
        } else {
          return of([]);
        }
      })
    ).subscribe({
      next: (medicamentsDetails: (Medicament | null)[]) => {
        medicamentsDetails.forEach((medDetail, index) => {
          if (medDetail) {
            this.medicaments.at(index).patchValue({
              medicamentNom: medDetail.nom
            });
          }
        });

        this.loadMedicalData();
      },
      error: () => {
        this.loading = false;
        this.message.error('Erreur lors du chargement du rendez-vous');
      }
    });
  }

  loadMedicalData(): void {
    this.donneesPhysioService.getDonneesByRdvId(this.rdvId).subscribe({
      next: (data: DonneesPhysiologiques) => {
        if (data) {
          this.medicalDataForm.patchValue({
            poids: data.poids,
            taille: data.taille,
            tensionSystolique: data.tensionSystolique,
            tensionDiastolica: data.tensionDiastolique,
            frequenceCardiaque: data.frequenceCardiaque,
            temperature: data.temperature,
            glycemie: data.glycemie,
            oeilDroit: data.oeilDroit,
            oeilGauche: data.oeilGauche,
            remarques: data.remarques
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setupMedicamentSearch(): void {
    this.medicamentSearchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword => {
        this.isLoadingMeds = true;
        return this.medicamentService.getMedicaments(0, keyword, 10).pipe(
          switchMap(response => {
            this.isLoadingMeds = false;
            return of(response.medicaments || []);
          })
        );
      })
    ).subscribe(medicaments => {
      this.medicamentsList = medicaments;
    });
  }

  formatDateTimeLocal(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onSearchMedicament(keyword: string): void {
    this.medicamentSearchTerm$.next(keyword);
  }

  onSubmit(): void {
    if (this.rdvForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading = true;
    const rdvData = this.prepareRdvData();
    const medicalData = this.prepareMedicalData();
    const medicamentsData = this.prepareMedicamentsData();

    forkJoin([
      this.rdvService.updateRdv(this.rdvId, rdvData),
      medicalData.id
        ? this.donneesPhysioService.updateDonneesPhysiologiques(medicalData.id, medicalData)
        : this.donneesPhysioService.saveDonneesPhysiologiques(medicalData, this.rdvId)
    ]).pipe(
      switchMap(() => {
        const medicamentRequests = [];
        const ordonnanceId = this.rdvForm.get('ordonnance.id')?.value;

        if (ordonnanceId) {
          for (const medicament of medicamentsData) {
            if (medicament.id) {
              medicamentRequests.push(
                this.ordonnanceMedicamentService.updateMedicament(
                  medicament.id,
                  this.mapToOrdonnanceMedicamentDTO(medicament, ordonnanceId)
                )
              );
            } else {
              medicamentRequests.push(
                this.ordonnanceMedicamentService.ajouterMedicament(
                  ordonnanceId,
                  this.mapToOrdonnanceMedicamentDTO(medicament, ordonnanceId)
                )
              );
            }
          }
        }

        return forkJoin(medicamentRequests);
      })
    ).subscribe({
      next: () => {
        this.message.success('Rendez-vous mis à jour avec succès');
        this.router.navigate(['/doc/patients/detail', this.patientId]);
      },
      error: (err) => {
        this.loading = false;
        this.message.error(`Erreur: ${err.error?.message || err.message}`);
      }
    });
  }

  prepareRdvData(): any {
    const formValue = this.rdvForm.getRawValue();
    return {
      id: this.rdvId,
      date: formValue.date,
      statusRDV: formValue.statusRDV,
      rapport: formValue.rapport,
      prix: formValue.prix,
      medecinId: formValue.medecin,
      patientId: formValue.patient,
      ordonnance: formValue.ordonnance.id ? {
        id: formValue.ordonnance.id,
        contenu: formValue.ordonnance.contenu,
        remarques: formValue.ordonnance.remarques
      } : {
        contenu: formValue.ordonnance.contenu,
        remarques: formValue.ordonnance.remarques
      }
    };
  }

  prepareMedicalData(): DonneesPhysiologiques {
    const formValue = this.medicalDataForm.value;
    return {
      id: formValue.id,
      poids: formValue.poids,
      taille: formValue.taille,
      tensionSystolique: formValue.tensionSystolique,
      tensionDiastolique: formValue.tensionDiastolica,
      frequenceCardiaque: formValue.frequenceCardiaque,
      frequenceRespiratoire: formValue.frequenceRespiratoire,
      temperature: formValue.temperature,
      glycemie: formValue.glycemie,
      oeilDroit: formValue.oeilDroit,
      oeilGauche: formValue.oeilGauche,
      remarques: formValue.remarques,
      rendezVousId: this.rdvId,
      imc: formValue.imc,
      rendezVousDate: formValue.rendezVousDate,

    };
  }

  prepareMedicamentsData(): any[] {
    return this.medicaments.getRawValue();
  }

  mapToOrdonnanceMedicamentDTO(medicament: any, ordonnanceId: number): OrdonnanceMedicamentDTO {
    return {
      id: medicament.id || undefined,
      medicamentId: medicament.medicamentId,
      ordonnanceId: ordonnanceId,
      dosage: medicament.posologie,
      duree: medicament.duree,
      frequence: medicament.frequence
    };
  }

  onCancel(): void {
    this.router.navigate(['/doc/patients/detail', this.patientId]);
  }

  calculateIMC(): number | null {
    const poids = this.medicalDataForm.get('poids')?.value;
    const taille = this.medicalDataForm.get('taille')?.value;

    if (poids && taille && taille > 0) {
      const tailleEnMetres = taille / 100;
      const imc = poids / (tailleEnMetres * tailleEnMetres);
      return parseFloat(imc.toFixed(1));
    }
    return null;
  }

  getIMCInterpretation(imc: number): string {
    if (!imc) return '';
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25) return 'Poids normal';
    if (imc < 30) return 'Surpoids';
    if (imc < 35) return 'Obésité modérée';
    if (imc < 40) return 'Obésité sévère';
    return 'Obésité morbide';
  }

  getIMCColor(imc: number): string {
    if (!imc) return '';
    if (imc < 18.5) return '#1890ff';
    if (imc < 25) return '#52c41a';
    if (imc < 30) return '#faad14';
    return '#f5222d';
  }

  getIMCIcon(imc: number): string {
    if (!imc) return '';
    if (imc < 18.5) return 'arrow-down';
    if (imc < 25) return 'check';
    if (imc < 30) return 'warning';
    return 'close';
  }
}
