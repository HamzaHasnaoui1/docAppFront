import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject, Observable } from 'rxjs';
import { switchMap, catchError, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
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
import { OrdonnanceService } from '../../../service/ordonnance.service';
import { Ordonnance } from '../../../models/ordonnance.model';
import { PdfService } from '../../../service/pdf.service';

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
  generatingPdf = false;

  constructor(
    private fb: FormBuilder,
    private rdvService: RdvService,
    private medicamentService: MedicamentService,
    private donneesPhysioService: DonneesPhysiologiquesService,
    private ordonnanceMedicamentService: OrdonnanceMedicamentService,
    private ordonnanceService: OrdonnanceService,
    private pdfService: PdfService,
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
      date: [null, Validators.required],
      statusRDV: ['PENDING', Validators.required],
      medecin: [null, Validators.required],
      patient: [null, Validators.required],
      prix: [0, [Validators.min(0), Validators.required]],
      rapport: [''],
      ordonnance: this.fb.group({
        id: [null],
        contenu: [''],
        remarques: [''],
        medicaments: this.fb.array([])
      })
    });

    this.medicalDataForm = this.fb.group({
      id: [null],
      poids: [null, [Validators.min(0)]],
      taille: [null, [Validators.min(0)]],
      tensionSystolique: [null, [Validators.min(0)]],
      tensionDiastolique: [null, [Validators.min(0)]],
      frequenceCardiaque: [null, [Validators.min(0)]],
      frequenceRespiratoire: [null],
      temperature: [null, [Validators.min(0)]],
      glycemie: [null, [Validators.min(0)]],
      oeilDroit: [''],
      oeilGauche: [''],
      remarques: [''],
      imc: [null],
      rendezVousDate: [null]
    });
  }

  get medicaments(): FormArray {
    return this.rdvForm.get('ordonnance.medicaments') as FormArray;
  }

  addMedicament(medicament?: any, posologie: string = '', duree: string = '', frequence: string = '', instructions: string = ''): void {
    const medicamentId = medicament?.id || medicament?.medicamentId;
    const medicamentNom = medicament?.nom || '';

    this.medicaments.push(this.fb.group({
      id: [medicament?.id || null],
      medicamentId: [medicamentId, Validators.required],
      medicamentNom: [medicamentNom],
      posologie: [posologie, Validators.required],
      duree: [duree],
      frequence: [frequence],
      instructions: [instructions]
    }));

    // If we have a medicament ID but no name, try to load it
    if (medicamentId && !medicamentNom) {
      this.medicamentService.getMedicamentById(medicamentId).subscribe(med => {
        if (med) {
          // Find the index of the last added medicament
          const lastIndex = this.medicaments.length - 1;
          this.medicaments.at(lastIndex).patchValue({
            medicamentNom: med.nom
          });
        }
      });
    }
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
          }
        }
        return of([]);
      }),
      switchMap((medicaments: OrdonnanceMedicamentDTO[]) => {
        // Clear existing medications
        this.medicaments.clear();

        if (medicaments && medicaments.length > 0) {
          // Add each medication to the form
          const medicamentPromises = medicaments.map(med => {
            if (!med.medicamentId) {
              return of(null);
            }
            return this.medicamentService.getMedicamentById(med.medicamentId).pipe(
              catchError(() => of(null))
            );
          });

          return forkJoin(medicamentPromises).pipe(
            switchMap((medicamentDetails: (Medicament | null)[]) => {
              medicaments.forEach((med, index) => {
                const medicamentDetail = medicamentDetails[index];
                this.addMedicament(
                  {
                    id: med.id,
                    medicamentId: med.medicamentId,
                    nom: medicamentDetail?.nom || ''
                  },
                  med.dosage,
                  med.duree || '',
                  med.frequence || '',
                  ''
                );
              });
              return of(medicaments);
            })
          );
        }
        return of([]);
      })
    ).subscribe({
      next: () => {
        this.loadMedicalData();
      },
      error: (err) => {
        this.loading = false;
        this.message.error('Erreur lors du chargement du rendez-vous: ' + (err.message || 'Erreur inconnue'));
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
            tensionDiastolique: data.tensionDiastolique,
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
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.rdvForm.controls).forEach(key => {
        const control = this.rdvForm.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            const subControl = control.get(subKey);
            subControl?.markAsTouched();
            subControl?.markAsDirty();
          });
        }
      });
      
      this.message.warning('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading = true;
    const rdvData = this.prepareRdvData();
    const medicalData = this.prepareMedicalData();
    const medicamentsData = this.prepareMedicamentsData();
    const ordonnanceData = this.prepareOrdonnanceData();

    console.log('RDV Data:', rdvData);

    // Étape 1: Mettre à jour le RDV sans l'ordonnance
    this.rdvService.updateRdv(this.rdvId, rdvData).pipe(
      catchError(err => {
        this.loading = false;
        this.message.error(`Erreur lors de la mise à jour du RDV: ${err.error?.message || err.message}`);
        console.error('Erreur de mise à jour RDV:', err);
        return of(null);
      }),
      switchMap(updatedRdv => {
        if (!updatedRdv) return of(null);
        
        // Étape 2: Mettre à jour ou créer les données médicales
        // Vérifier si les données médicales existent déjà
        let medicalDataOperation;
        
        if (medicalData.id) {
          // Créer une copie sans rendezVousId pour la mise à jour
          const { rendezVousId, ...updateData } = medicalData as any;
          medicalDataOperation = this.donneesPhysioService.updateDonneesPhysiologiques(
            medicalData.id, 
            updateData as DonneesPhysiologiques
          );
        } else {
          medicalDataOperation = this.donneesPhysioService.saveDonneesPhysiologiques(
            medicalData, 
            this.rdvId
          );
        }
        
        return medicalDataOperation.pipe(
          catchError(err => {
            console.error('Erreur données physiologiques:', err);
            // On continue même en cas d'erreur sur les données physiologiques
            return of(null);
          }),
          switchMap(() => {
            // Étape 3: Gérer l'ordonnance et les médicaments
            const ordId = updatedRdv.ordonnance?.id;
            
            // Si l'ordonnance existe déjà, la mettre à jour
            if (ordId && ordonnanceData) {
              return this.ordonnanceService.updateOrdonnance(
                ordId, 
                {
                  id: ordId,
                  ...ordonnanceData
                }
              ).pipe(
                catchError(err => {
                  console.error('Erreur mise à jour ordonnance:', err);
                  return of(null);
                }),
                switchMap(() => {
                  if (medicamentsData.length > 0) {
                    // Nous savons que ordId est défini ici car nous sommes dans la condition ordId && ordonnanceData
                    const ordonnanceIdNumber = Number(ordId);
                    return this.processOrdonnanceMedicaments(medicamentsData, ordonnanceIdNumber);
                  }
                  return of(null);
                })
              );
            }
            // Si pas d'ordonnance mais des médicaments, créer une ordonnance
            else if (!ordId && medicamentsData.length > 0) {
              const newOrdonnance: Ordonnance = {
                contenu: this.rdvForm.get('ordonnance.contenu')?.value || '',
                remarques: this.rdvForm.get('ordonnance.remarques')?.value || '',
                dateEmission: new Date().toISOString(),
                archivee: false,
                rendezVous: { id: this.rdvId } as any
              };
              
              return this.ordonnanceService.createOrdonnance(newOrdonnance).pipe(
                catchError(err => {
                  console.error('Erreur création ordonnance:', err);
                  return of(null);
                }),
                switchMap(createdOrdonnance => {
                  if (createdOrdonnance && createdOrdonnance.id && medicamentsData.length > 0) {
                    const newOrdId = Number(createdOrdonnance.id);
                    return this.processOrdonnanceMedicaments(medicamentsData, newOrdId);
                  }
                  return of(null);
                })
              );
            }
            
            return of(null);
          })
        );
      })
    ).subscribe({
      next: () => {
        this.message.success('Rendez-vous mis à jour avec succès');
        this.router.navigate(['/doc/patients/detail', this.patientId]);
      },
      error: (err) => {
        this.loading = false;
        this.message.error(`Erreur: ${err.error?.message || err.message}`);
        console.error('Erreur générale:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  prepareRdvData(): any {
    const formValue = this.rdvForm.getRawValue();
    // Format strict pour éviter les problèmes de contrainte
    return {
      id: this.rdvId,
      date: formValue.date,
      statusRDV: formValue.statusRDV,
      rapport: formValue.rapport || '',
      prix: Number(formValue.prix) || 0,
      // Utiliser un format strict pour les IDs
      medecin: { id: Number(formValue.medecin) },
      patient: { id: Number(formValue.patient) }
      // Ne pas inclure l'ordonnance ici pour éviter les problèmes de cascade
    };
  }

  prepareMedicalData(): DonneesPhysiologiques {
    const formValue = this.medicalDataForm.value;
    
    // Base object with common properties
    const baseData = {
      id: formValue.id,
      poids: formValue.poids,
      taille: formValue.taille,
      tensionSystolique: formValue.tensionSystolique,
      tensionDiastolique: formValue.tensionDiastolique,
      frequenceCardiaque: formValue.frequenceCardiaque,
      frequenceRespiratoire: formValue.frequenceRespiratoire || 0,
      temperature: formValue.temperature,
      glycemie: formValue.glycemie,
      oeilDroit: formValue.oeilDroit || '',
      oeilGauche: formValue.oeilGauche || '',
      remarques: formValue.remarques || '',
      imc: formValue.imc || 0,
      rendezVousDate: formValue.rendezVousDate || new Date().toISOString()
    };
    
    // Add rendezVousId only for new records
    if (!formValue.id) {
      return {
        ...baseData,
        rendezVousId: this.rdvId
      };
    }
    
    return baseData as DonneesPhysiologiques;
  }

  prepareMedicamentsData(): any[] {
    return this.medicaments.getRawValue();
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

  // Nouvelle méthode pour traiter les médicaments d'une ordonnance avec un ID défini
  private processOrdonnanceMedicaments(medicamentsData: any[], ordonnanceId: number): Observable<any> {
    // Debug log
    console.log('Processing medicaments for ordonnance:', ordonnanceId);
    console.log('Medicaments data:', medicamentsData);
    
    // Ensure ordonnanceId is a number
    const safeOrdonnanceId = Number(ordonnanceId);
    
    // Plutôt que de mettre à jour chaque médicament individuellement,
    // nous allons d'abord récupérer l'ordonnance complète
    return this.ordonnanceService.getOrdonnanceById(safeOrdonnanceId).pipe(
      catchError(err => {
        console.error('Erreur lors de la récupération de l\'ordonnance:', err);
        return of(null);
      }),
      switchMap(ordonnance => {
        if (!ordonnance) return of(null);
        
        // Créer des requêtes pour chaque médicament
        const medicamentRequests = medicamentsData.map(medicament => {
          // Créer le DTO avec le format attendu par le backend
          const dto: OrdonnanceMedicamentDTO = {
            medicamentId: Number(medicament.medicamentId) || 0,
            medicament: {
              id: Number(medicament.medicamentId) || 0
            },
            dosage: medicament.posologie || '',
            duree: medicament.duree || '',
            frequence: medicament.frequence || ''
          };
          
          // Ajouter l'ID si existant
          if (medicament.id) {
            dto.id = medicament.id;
          }
          
          // Debug: log the DTO being sent
          console.log('Sending medicament DTO:', JSON.stringify(dto));
          
          if (medicament.id) {
            return this.ordonnanceMedicamentService.updateMedicament(
              medicament.id,
              dto
            ).pipe(
              catchError(err => {
                console.error(`Erreur mise à jour médicament ${medicament.medicamentId}:`, err);
                return of(null);
              })
            );
          } else {
            return this.ordonnanceMedicamentService.ajouterMedicament(
              safeOrdonnanceId,
              dto
            ).pipe(
              catchError(err => {
                console.error(`Erreur ajout médicament ${medicament.medicamentId}:`, err);
                return of(null);
              })
            );
          }
        });

        return medicamentRequests.length ? forkJoin(medicamentRequests) : of(null);
      })
    );
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

  // Generate PDF prescription
  generatePrescription(): void {
    const ordonnanceId = this.rdvForm.get('ordonnance.id')?.value;
    if (!ordonnanceId) {
      this.message.warning('Veuillez d\'abord enregistrer l\'ordonnance');
      return;
    }

    if (this.medicaments.length === 0) {
      this.message.warning('Aucun médicament n\'a été ajouté à l\'ordonnance');
      return;
    }

    this.generatingPdf = true;

    // First get the ordonnance details
    this.ordonnanceService.getOrdonnanceById(ordonnanceId).subscribe({
      next: (ordonnance) => {
        // Then generate the PDF
        this.pdfService.generateOrdonnancePdf(ordonnance)
          .then(() => {
            this.message.success('Ordonnance générée avec succès');
            this.generatingPdf = false;
          })
          .catch((error: Error) => {
            this.message.error('Erreur lors de la génération de l\'ordonnance: ' + error.message);
            this.generatingPdf = false;
          });
      },
      error: (err: any) => {
        this.message.error('Erreur lors de la récupération de l\'ordonnance');
        console.error('Erreur récupération ordonnance:', err);
        this.generatingPdf = false;
      }
    });
  }
}
