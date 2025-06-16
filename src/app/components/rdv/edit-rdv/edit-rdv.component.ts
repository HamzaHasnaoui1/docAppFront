import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormArray,
  AbstractControl
} from '@angular/forms';
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
import {RdvService} from '../../../service/rdv.service';
import {Medecin} from '../../../models/medecin.model';
import {Ordonnance} from '../../../models/ordonnance.model';
import {RendezVous} from '../../../models/rdv.model';
import {NzDatePickerComponent} from 'ng-zorro-antd/date-picker';
import {OrdonnanceService} from '../../../service/ordonnance.service';
import {NzAlertComponent} from 'ng-zorro-antd/alert';
import {NzPopconfirmComponent, NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {MedicamentService} from '../../../service/medicament.service';
import {Medicament} from '../../../models/Medicament.model';
import {forkJoin, of, Subject, Observable, throwError, concat} from 'rxjs';
import {switchMap, catchError, debounceTime, distinctUntilChanged, finalize, tap} from 'rxjs/operators';
import {OrdonnanceMedicamentService} from '../../../service/ordonnance-medicament.service';
import {OrdonnanceMedicament} from '../../../models/OrdonnanceMedicament.model';
import {DonneesPhysiologiques} from '../../../models/DonneesPhysiologiques.model';
import {DonneesPhysiologiquesService} from '../../../service/donnees-physiologiques.service';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzTabComponent, NzTabSetComponent} from 'ng-zorro-antd/tabs';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import { NzI18nService, fr_FR } from 'ng-zorro-antd/i18n';
import {NzTooltipDirective} from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-edit-rdv',
  templateUrl: './edit-rdv.component.html',
  standalone: true,
  styleUrl: './edit-rdv.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
    AngularEditorModule,
    NzDatePickerComponent,
    NzAlertComponent,
    NzPopconfirmComponent,
    NzTableComponent,
    NzPopconfirmModule,
    NzEmptyComponent,
    NzTabSetComponent,
    NzTabComponent,
    NzAvatarComponent,
    NzTagComponent,
    NzInputNumberComponent,
    NzDividerComponent,
    NzTooltipDirective,
  ]
})
export class EditRdvComponent implements OnInit {
  rdvForm!: FormGroup;
  rdvId!: number;
  patientId!: number;
  patientName: string = '';
  medecinName: string = '';
  ordonnaceForm!: FormGroup;
  ordonnanceId?: number;
  ordonnanceExists = false;
  medicaments: OrdonnanceMedicament[] = [];
  medicamentForm!: FormGroup;
  currentMedicament?: OrdonnanceMedicament;
  medicamentsList: Medicament[] = [];
  filteredMedicaments: Medicament[] = [];
  medicamentSearchValue = '';
  loading = false;
  isLoadingMeds = false;
  medicamentSearchTerm$ = new Subject<string>();
  currentMedicamentIndex?: number;
  donneesPhysioForm!: FormGroup;
  donneesPhysio: DonneesPhysiologiques | null = null;

  editorConfig: AngularEditorConfig = {
    height: '120px',
    editable: true,
    spellcheck: true,
    translate: 'yes',
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo'],
      ['fontSize', 'toggleEditorMode']
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ]
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rdvService: RdvService,
    private ordonnanceService: OrdonnanceService,
    private ordonnaceMedicamentService: OrdonnanceMedicamentService,
    private medicamentService: MedicamentService,
    private message: NzMessageService,
    private location: Location,
    private donneesPhysioService: DonneesPhysiologiquesService,
    private i18n: NzI18nService
  ) {
    this.i18n.setLocale(fr_FR);
  }

  initForm(): void {
    this.rdvForm = this.fb.group({
      date: [''],
      dateFin: [''],
      statusRDV: ['PENDING'],
      patient: [''],
      medecin: [''],
      rapport: [''],
      prix: [0],
      ordonnance: this.fb.group({
        id: [null],
        contenu: [''],
        remarques: [''],
        medicaments: this.fb.array([])
      })
    });

    this.ordonnaceForm = this.fb.group({
      contenu: [''],
      dateEmission: [''],
      archivee: false,
      remarques: [''],
    });

    this.medicamentForm = this.fb.group({
      medicamentId: [null, Validators.required],
      posologie: ['', Validators.required],
      duree: ['', Validators.required],
      frequence: ['', Validators.required],
      instructions: ['']
    });

    this.donneesPhysioForm = this.fb.group({
      poids: [null, [Validators.min(0)]],
      taille: [null, [Validators.min(0)]],
      imc: [{value: null, disabled: true}],
      oeilDroit: [''],
      oeilGauche: [''],
      tensionSystolique: [null, [Validators.min(0)]],
      tensionDiastolique: [null, [Validators.min(0)]],
      frequenceCardiaque: [null, [Validators.min(0)]],
      frequenceRespiratoire: [null, [Validators.min(0)]],
      temperature: [null, [Validators.min(0)]],
      glycemie: [null, [Validators.min(0)]],
      remarques: ['']
    });
  }

  ngOnInit(): void {
    this.rdvId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadRdv();
    this.setupMedicamentSearch();
    this.donneesPhysioForm.get('poids')?.valueChanges.subscribe(() => this.calculateIMC());
    this.donneesPhysioForm.get('taille')?.valueChanges.subscribe(() => this.calculateIMC());
  }

  getIMCInterpretation(): string {
    const imc = this.donneesPhysioForm.get('imc')?.value;
    if (!imc) return '';

    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25) return 'Poids normal';
    if (imc < 30) return 'Surpoids';
    return 'Obésité';
  }

  calculateIMC(): void {
    const poids = this.donneesPhysioForm.get('poids')?.value;
    const taille = this.donneesPhysioForm.get('taille')?.value;

    if (poids && taille && taille > 0) {
      const tailleEnMetres = taille / 100;
      const imc = poids / (tailleEnMetres * tailleEnMetres);
      this.donneesPhysioForm.get('imc')?.setValue(imc.toFixed(2));
    } else {
      this.donneesPhysioForm.get('imc')?.setValue(null);
    }
  }

  get medicamentsFormArray(): FormArray {
    return this.rdvForm.get('ordonnance.medicaments') as FormArray;
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
          }),
          catchError(() => {
            this.isLoadingMeds = false;
            return of([]);
          })
        );
      })
    ).subscribe(medicaments => {
      this.medicamentsList = medicaments;
      this.filteredMedicaments = medicaments;
    });

    this.onSearchMedicament('');
  }

  onSearchMedicament(keyword: string): void {
    this.medicamentSearchTerm$.next(keyword);
  }

  addMedicament(medicament?: any, posologie: string = '', duree: string = '', frequence: string = '', instructions: string = ''): void {
    const medicamentId = medicament?.id || medicament?.medicamentId;
    const medicamentNom = medicament?.nom || '';

    const group = this.fb.group({
      id: [medicament?.id || null],
      medicamentId: [medicamentId, Validators.required],
      medicamentNom: [medicamentNom],
      posologie: [posologie, Validators.required],
      duree: [duree],
      frequence: [frequence],
      instructions: [instructions]
    });

    this.medicamentsFormArray.push(group);
  }

  removeMedicament(index: number): void {
    const medicamentGroup = this.medicamentsFormArray.at(index);
    const medicamentId = medicamentGroup.get('id')?.value;

    if (medicamentId) {
      this.loading = true;
      this.ordonnaceMedicamentService.deleteMedicament(medicamentId).subscribe({
        next: () => {
          this.medicamentsFormArray.removeAt(index);
          this.message.success('Médicament supprimé avec succès');
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.message.error(`Erreur lors de la suppression: ${err.message}`);
        }
      });
    } else {
      this.medicamentsFormArray.removeAt(index);
    }
  }

  loadRdv(): void {
    this.loading = true;
    this.rdvService.getRdvById(this.rdvId).pipe(
      switchMap((rdv: RendezVous) => {
        this.patientId = rdv.patient?.id || 0;
        this.patientName = `${rdv.patient?.nom || 'Patient inconnu'}`;
        this.medecinName = `${rdv.medecin?.nom || 'Médecin inconnu'}`;

        this.rdvForm.patchValue({
          date: rdv.date,
          dateFin: rdv.dateFin,
          statusRDV: rdv.statusRDV,
          patient: rdv.patient,
          medecin: rdv.medecin,
          rapport: rdv.rapport,
          prix: rdv.prix,
        });

        let medicamentsObservable: Observable<OrdonnanceMedicament[]> = of([]);
        let donneesPhysioObservable: Observable<DonneesPhysiologiques | null> = of(null);

        if (rdv.ordonnance) {
          this.ordonnanceId = rdv.ordonnance.id;
          this.ordonnanceExists = true;

          this.rdvForm.get('ordonnance')?.patchValue({
            id: rdv.ordonnance.id,
            contenu: rdv.ordonnance.contenu ?? '',
            remarques: rdv.ordonnance.remarques ?? ''
          });

          this.ordonnaceForm.patchValue({
            contenu: rdv.ordonnance.contenu,
            dateEmission: rdv.ordonnance.dateEmission,
            archivee: rdv.ordonnance.archivee,
            remarques: rdv.ordonnance.remarques,
          });

          const ordonnanceId = rdv.ordonnance.id;
          if (ordonnanceId != null) {
            medicamentsObservable = this.ordonnaceMedicamentService.getMedicamentsByOrdonnance(ordonnanceId);
          }
        } else {
          this.ordonnanceExists = false;
        }

        donneesPhysioObservable = this.donneesPhysioService.getDonneesByRdvId(this.rdvId).pipe(
          catchError(() => of(null))
        );

        return forkJoin([
          of(rdv),
          medicamentsObservable,
          donneesPhysioObservable
        ]) as Observable<[RendezVous, OrdonnanceMedicament[], DonneesPhysiologiques | null]>;
      }),
      switchMap(([rdv, medicaments, donneesPhysio]: [RendezVous, OrdonnanceMedicament[], DonneesPhysiologiques | null]) => {
        this.medicamentsFormArray.clear();

        if (medicaments && medicaments.length > 0) {
          medicaments.forEach(med => {
            this.addMedicament(
              {
                id: med.id,
                medicamentId: med.medicament?.id || 0,
                nom: med.medicament?.nom || 'Nom inconnu'
              },
              med.posologie || '',
              med.duree || '',
              med.frequence || '',
              med.instructions || ''
            );
          });
        }

        this.donneesPhysio = donneesPhysio;
        if (donneesPhysio) {
          this.donneesPhysioForm.patchValue({
            poids: donneesPhysio.poids,
            taille: donneesPhysio.taille,
            imc: donneesPhysio.imc,
            oeilDroit: donneesPhysio.oeilDroit,
            oeilGauche: donneesPhysio.oeilGauche,
            tensionSystolique: donneesPhysio.tensionSystolique,
            tensionDiastolique: donneesPhysio.tensionDiastolique,
            frequenceCardiaque: donneesPhysio.frequenceCardiaque,
            frequenceRespiratoire: donneesPhysio.frequenceRespiratoire,
            temperature: donneesPhysio.temperature,
            glycemie: donneesPhysio.glycemie,
            remarques: donneesPhysio.remarques
          });
        }

        return of(rdv);
      }),
      catchError((err) => {
        this.loading = false;
        this.message.error('Erreur lors du chargement du rendez-vous: ' + (err.message || 'Erreur inconnue'));
        return throwError(err);
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      error: () => {}
    });
  }

  filterMedicaments(search: string): void {
    this.medicamentSearchValue = search;
    this.onSearchMedicament(search);
  }

  onSelectMedicamentForEdit(medicament: OrdonnanceMedicament): void {
    this.currentMedicament = medicament;
    this.medicamentForm.patchValue({
      medicamentId: medicament.medicament?.id || null,
      posologie: medicament.posologie,
      duree: medicament.duree,
      frequence: medicament.frequence,
      instructions: medicament.instructions
    });
  }

  onSubmitMedicament(): void {
    if (this.medicamentForm.valid && this.ordonnanceId) {
      this.loading = true;
      const formValue = this.medicamentForm.value;
      const selectedMedicamentId = formValue.medicamentId;
      const selectedMedicament = this.medicamentsList.find(m => m.id === selectedMedicamentId);

      if (!selectedMedicament) {
        this.message.error('Veuillez sélectionner un médicament valide');
        this.loading = false;
        return;
      }

      const medicamentDto = {
        ordonnanceId: this.ordonnanceId,
        medicament: {
          id: selectedMedicamentId,
          nom: selectedMedicament.nom,
          description: selectedMedicament.description || '',
          categorie: selectedMedicament.categorie || '',
          fabricant: selectedMedicament.fabricant || '',
          dosageStandard: selectedMedicament.dosageStandard || '',
          actif: selectedMedicament.actif || true
        },
        posologie: formValue.posologie,
        duree: formValue.duree,
        frequence: formValue.frequence,
        instructions: formValue.instructions || ''
      };

      if (this.currentMedicamentIndex !== undefined) {
        // Mise à jour d'un médicament existant
        const medGroup = this.medicamentsFormArray.at(this.currentMedicamentIndex);
        const medicamentId = medGroup.get('id')?.value;

        if (medicamentId) {
          this.ordonnaceMedicamentService.updateMedicament(medicamentId, medicamentDto)
            .subscribe({
              next: (updatedMedicament) => {
                if (this.currentMedicamentIndex !== undefined) {
                  const medGroup = this.medicamentsFormArray.at(this.currentMedicamentIndex);
                  if (medGroup) {
                    medGroup.patchValue({
                      id: updatedMedicament.id,
                      medicamentId: selectedMedicamentId,
                      medicamentNom: selectedMedicament.nom,
                      posologie: formValue.posologie,
                      duree: formValue.duree,
                      frequence: formValue.frequence,
                      instructions: formValue.instructions
                    });
                  }
                }
                this.message.success('Médicament mis à jour avec succès');
                this.resetMedicamentForm();
                this.loading = false;
              },
              error: (error) => {
                this.message.error('Erreur lors de la mise à jour du médicament');
                this.loading = false;
              }
            });
        }
      } else {
        this.ordonnaceMedicamentService.ajouterMedicament(this.ordonnanceId, medicamentDto)
          .subscribe({
            next: (newMedicament) => {
              this.addMedicament({
                id: newMedicament.id,
                medicamentId: selectedMedicamentId,
                nom: selectedMedicament.nom,
                posologie: formValue.posologie,
                duree: formValue.duree,
                frequence: formValue.frequence,
                instructions: formValue.instructions
              });
              this.message.success('Médicament ajouté avec succès');
              this.resetMedicamentForm();
              this.loading = false;
            },
            error: (error) => {
              this.message.error('Erreur lors de l\'ajout du médicament');
              this.loading = false;
            }
          });
      }
    } else {
      if (!this.ordonnanceId) {
        this.message.warning('Veuillez d\'abord créer une ordonnance');
      } else {
        this.message.warning('Veuillez remplir tous les champs obligatoires');
      }
    }
  }

  resetMedicamentForm(): void {
    this.medicamentForm.reset();
    this.currentMedicamentIndex = undefined;
  }

  onSubmitOrdonnance(): void {
    if (this.ordonnaceForm.valid) {
      const ordonnanceData: Ordonnance = {
        ...this.ordonnaceForm.value
      };

      if (this.ordonnanceExists && this.ordonnanceId) {
        this.ordonnanceService.updateOrdonnance(this.ordonnanceId, ordonnanceData).subscribe({
          next: () => {
            this.message.success('Ordonnance modifiée avec succès');
            this.rdvForm.get('ordonnance')?.patchValue({
              contenu: ordonnanceData.contenu,
              remarques: ordonnanceData.remarques
            });
          },
          error: () => this.message.error('Erreur lors de la modification')
        });
      } else {
        const newOrdonnance: Ordonnance = {
          ...ordonnanceData,
          dateEmission: new Date().toISOString(),
          archivee: false,
          rendezVous: { id: this.rdvId } as any
        };

        this.ordonnanceService.createOrdonnance(newOrdonnance).subscribe({
          next: (createdOrdonnance) => {
            this.message.success('Ordonnance créée avec succès');
            this.ordonnanceId = createdOrdonnance.id;
            this.ordonnanceExists = true;

            this.rdvForm.get('ordonnance')?.patchValue({
              id: createdOrdonnance.id,
              contenu: createdOrdonnance.contenu,
              remarques: createdOrdonnance.remarques
            });
          },
          error: () => this.message.error('Erreur lors de la création')
        });
      }
    }
  }

  onSubmitDonneesPhysio(): void {
    if (this.donneesPhysioForm.invalid) {
      this.message.warning('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.loading = true;
    const donneesData = this.prepareDonneesPhysioData();

    if (!donneesData) {
      this.loading = false;
      return;
    }

    let saveAction: Observable<DonneesPhysiologiques>;

    if (this.donneesPhysio) {
      saveAction = this.donneesPhysioService.updateDonneesPhysiologiques(
        this.donneesPhysio.id,
        donneesData
      );
    } else {
      saveAction = this.donneesPhysioService.saveDonneesPhysiologiques(
        donneesData,
        this.rdvId
      );
    }

    saveAction.subscribe({
      next: (savedData) => {
        this.donneesPhysio = savedData;
        this.message.success('Données physiologiques sauvegardées avec succès');
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.message.error(`Erreur lors de la sauvegarde: ${err.error?.message || err.message}`);
      }
    });
  }

  onCancelDonneesPhysio(): void {
    if (this.donneesPhysio) {
      this.donneesPhysioForm.patchValue({
        poids: this.donneesPhysio.poids,
        taille: this.donneesPhysio.taille,
        imc: this.donneesPhysio.imc,
        oeilDroit: this.donneesPhysio.oeilDroit,
        oeilGauche: this.donneesPhysio.oeilGauche,
        tensionSystolique: this.donneesPhysio.tensionSystolique,
        tensionDiastolique: this.donneesPhysio.tensionDiastolique,
        frequenceCardiaque: this.donneesPhysio.frequenceCardiaque,
        frequenceRespiratoire: this.donneesPhysio.frequenceRespiratoire,
        temperature: this.donneesPhysio.temperature,
        glycemie: this.donneesPhysio.glycemie,
        remarques: this.donneesPhysio.remarques
      });
    } else {
      this.donneesPhysioForm.reset();
    }
    this.message.info('Modifications annulées');
  }

  prepareDonneesPhysioData(): DonneesPhysiologiques | null {
    if (!this.donneesPhysioForm.valid) {
      return null;
    }

    const formValue = this.donneesPhysioForm.getRawValue();
    return {
      id: this.donneesPhysio?.id || 0,
      rendezVousId: this.rdvId,
      rendezVousDate: new Date().toISOString(),
      poids: formValue.poids,
      taille: formValue.taille,
      imc: parseFloat(formValue.imc) || 0,
      oeilDroit: formValue.oeilDroit,
      oeilGauche: formValue.oeilGauche,
      tensionSystolique: formValue.tensionSystolique,
      tensionDiastolique: formValue.tensionDiastolique,
      frequenceCardiaque: formValue.frequenceCardiaque,
      frequenceRespiratoire: formValue.frequenceRespiratoire,
      temperature: formValue.temperature,
      glycemie: formValue.glycemie,
      remarques: formValue.remarques
    };
  }

  onSubmitRdv(): void {
    if (this.rdvForm.invalid) {
      this.message.warning('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading = true;
    const rdvData = this.prepareRdvData();
    const medicamentsData = this.prepareMedicamentsData();
    const ordonnanceData = this.prepareOrdonnanceData();
    const donneesPhysioData = this.prepareDonneesPhysioData();

    this.rdvService.updateRdv(this.rdvId, rdvData).pipe(
      catchError(err => {
        this.loading = false;
        this.message.error(`Erreur lors de la mise à jour du RDV: ${err.error?.message || err.message}`);
        return of(null);
      }),
      switchMap(updatedRdv => {
        if (!updatedRdv) return of(null);

        const ordId = this.ordonnanceId;
        let ordonnanceAction: Observable<any> = of(null);

        if (ordId && ordonnanceData) {
          ordonnanceAction = this.ordonnanceService.updateOrdonnance(ordId, {
            id: ordId,
            ...ordonnanceData
          }).pipe(
            catchError(err => {
              console.error('Erreur mise à jour ordonnance:', err);
              return of(null);
            }),
            switchMap(() => {
              if (medicamentsData.length > 0) {
                return this.processOrdonnanceMedicaments(medicamentsData, ordId);
              }
              return of(null);
            })
          );
        }


        return forkJoin([
          ordonnanceAction
          //donneesPhysioAction
        ]);
      })
    ).subscribe({
      next: () => {
        this.message.success('Rendez-vous mis à jour avec succès');
      },
      error: (err) => {
        this.loading = false;
        this.message.error(`Erreur: ${err.error?.message || err.message}`);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  prepareRdvData(): any {
    const formValue = this.rdvForm.getRawValue();
    return {
      id: this.rdvId,
      date: formValue.date,
      dateFin: formValue.dateFin,
      statusRDV: formValue.statusRDV,
      rapport: formValue.rapport || '',
      prix: Number(formValue.prix) || 0,
      medecin: formValue.medecin,
      patient: formValue.patient
    };
  }

  prepareMedicamentsData(): any[] {
    return this.medicamentsFormArray.getRawValue();
  }

  prepareOrdonnanceData(): any {
    const ordonnanceGroup = this.rdvForm.get('ordonnance');
    if (!ordonnanceGroup) return null;

    const ordonnanceValue = ordonnanceGroup.value;
    if (!ordonnanceValue) return null;

    return {
      contenu: ordonnanceValue.contenu || '',
      remarques: ordonnanceValue.remarques || '',
      archivee: false
    };
  }

  private processOrdonnanceMedicaments(medicamentsData: any[], ordonnanceId: number): Observable<any> {
    const safeOrdonnanceId = Number(ordonnanceId);

    const medicamentRequests = medicamentsData.map(medicament => {
      const dto: OrdonnanceMedicament = {
        posologie: medicament.posologie || '',
        duree: medicament.duree || '',
        frequence: medicament.frequence || '',
        instructions: medicament.instructions || '',
        medicament: {
          id: Number(medicament.medicamentId) || 0,
          nom: medicament.medicamentNom || ''
        }
      };

      if (medicament.id) {
        dto.id = medicament.id;
      }

      if (medicament.id) {
        return this.ordonnaceMedicamentService.updateMedicament(medicament.id, dto).pipe(
          catchError(err => {
            console.error(`Erreur mise à jour médicament ${medicament.medicamentId}:`, err);
            return of(null);
          })
        );
      } else {
        return this.ordonnaceMedicamentService.ajouterMedicament(safeOrdonnanceId, dto).pipe(
          catchError(err => {
            console.error(`Erreur ajout médicament ${medicament.medicamentId}:`, err);
            return of(null);
          })
        );
      }
    });

    return medicamentRequests.length ? forkJoin(medicamentRequests) : of(null);
  }
  onCancelMedicament(): void {
    if (this.ordonnanceId) {
      this.router.navigate(['/doc/patients/detail', this.patientId]);
    } else {
      this.location.back();
    }
  }

  onCancelOrdonnance(): void {
    if (this.ordonnanceId) {
      this.router.navigate(['/doc/patients/detail', this.patientId]);
    } else {
      this.location.back();
    }
  }

  onCancelRdv(): void {
    if (this.rdvId) {
      this.router.navigate(['/doc/patients/detail', this.patientId]);
    } else {
      this.location.back();
    }
  }

  onEditMedicament(medGroup: AbstractControl, index: number): void {
    this.currentMedicamentIndex = index;
    const values = medGroup.value;

    this.medicamentForm.patchValue({
      medicamentId: values.medicamentId,
      posologie: values.posologie,
      duree: values.duree,
      frequence: values.frequence,
      instructions: values.instructions
    });
  }

  selectedTabIndex = 0;

  get rdvStatus(): string {
    return this.rdvForm.get('statusRDV')?.value || 'PENDING';
  }

  get rdvDate(): Date | null {
    const dateValue = this.rdvForm.get('date')?.value;
    return dateValue ? new Date(dateValue) : null;
  }

  saveAll(): void {
    this.loading = true;
    const saves: Observable<any>[] = [];

    if (this.donneesPhysioForm.valid) {
      saves.push(this.saveDonneesPhysiologiques());
    }

    if (this.ordonnaceForm.valid) {
      saves.push(this.saveOrdonnance());
    }

    if (this.ordonnanceExists && this.medicamentsFormArray.length > 0) {
      saves.push(this.saveMedicaments());
    }

    saves.push(this.saveRdv());

    concat(...saves).pipe(
      finalize(() => {
        this.loading = false;
        this.message.success('Toutes les données ont été sauvegardées');
      })
    ).subscribe({
      next: () => {},
      error: (err: { message: any; }) => this.message.error(`Erreur: ${err.message}`)
    });
  }

  private saveDonneesPhysiologiques(): Observable<any> {
    if (this.donneesPhysioForm.invalid) return of(null);

    const donneesData = this.prepareDonneesPhysioData();
    if (!donneesData) return of(null);

    if (this.donneesPhysio) {
      return this.donneesPhysioService.updateDonneesPhysiologiques(
        this.donneesPhysio.id,
        donneesData
      );
    } else {
      return this.donneesPhysioService.saveDonneesPhysiologiques(
        donneesData,
        this.rdvId
      );
    }
  }

  private saveOrdonnance(): Observable<any> {
    const ordonnanceData: Ordonnance = {
      ...this.ordonnaceForm.value,
      dateEmission: new Date().toISOString(),
      archivee: false
    };

    if (this.ordonnanceExists && this.ordonnanceId) {
      return this.ordonnanceService.updateOrdonnance(this.ordonnanceId, ordonnanceData);
    } else {
      const newOrdonnance: Ordonnance = {
        ...ordonnanceData,
        rendezVous: { id: this.rdvId } as any
      };
      return this.ordonnanceService.createOrdonnance(newOrdonnance).pipe(
        tap(createdOrdonnance => {
          this.ordonnanceId = createdOrdonnance.id;
          this.ordonnanceExists = true;
        })
      );
    }
  }

  private saveMedicaments(): Observable<any> {
    if (!this.ordonnanceId) return of(null);

    const medicamentsData = this.medicamentsFormArray.getRawValue();
    return this.processOrdonnanceMedicaments(medicamentsData, this.ordonnanceId);
  }

  private saveRdv(): Observable<any> {
    const rdvData = this.prepareRdvData();
    return this.rdvService.updateRdv(this.rdvId, rdvData);
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'CONFIRMED': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  }

  getIMCStatus(imc: number | null): string {
    if (imc === null || imc === undefined) return '';
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25) return 'Poids normal';
    if (imc < 30) return 'Surpoids';
    return 'Obésité';
  }

  getIMCColor(imc: number | null): string {
    if (imc === null || imc === undefined) return 'default';
    if (imc < 18.5) return 'orange';
    if (imc < 25) return 'green';
    if (imc < 30) return 'orange';
    return 'red';
  }

  redirectToCreateMedicament(): void {
    const currentUrl = `/doc/rdv/edit/${this.rdvId}`;
    this.router.navigate(['/doc/medicament/create'], {
      queryParams: { returnUrl: currentUrl }
    });
  }

  clearOrdonnanceContent(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const contenuControl = this.ordonnaceForm.get('contenu');
    if (contenuControl) {
      contenuControl.setValue('');
      contenuControl.markAsDirty();

    }
  }

  clearRemarques(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const remarquesControl = this.ordonnaceForm.get('remarques');
    if (remarquesControl) {
      remarquesControl.setValue('');
      remarquesControl.markAsDirty();
    }
  }

  clearPhysioRemarques(event: Event): void {
  event.stopPropagation();
  event.preventDefault();

  const remarquesControl = this.donneesPhysioForm.get('remarques');
  if (remarquesControl) {
    remarquesControl.setValue('');
    remarquesControl.markAsDirty();
  }
}

}

