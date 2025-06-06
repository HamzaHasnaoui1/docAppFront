import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {catchError, map, Observable, throwError, of, switchMap, forkJoin, finalize} from 'rxjs';

import { Patient } from '../../../models/patient.model';
import { RDV_STATUS_CONFIG, RdvStatus, RendezVous } from '../../../models/rdv.model';

import { PatientService } from '../../../service/patient.service';
import { RdvService } from '../../../service/rdv.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from 'ng-zorro-antd/descriptions';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTabComponent, NzTabSetComponent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzResultModule } from 'ng-zorro-antd/result';
import { PdfService } from '../../../service/pdf.service';
import { NzCheckboxGroupComponent, NzCheckboxWrapperComponent } from 'ng-zorro-antd/checkbox';
import { PatientStatsComponent } from '../patient-stats/patient-stats.component';
import { OrdonnanceService } from '../../../service/ordonnance.service';
import { Document } from '../../../models/document.model';
import { DocumentAttachmentComponent } from '../../../shared/document-attachment/document-attachment.component';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    DatePipe,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzAlertModule,
    NzSpaceModule,
    NzPopconfirmDirective,
    NzModalModule,
    NzToolTipModule,
    FormsModule,
    ReactiveFormsModule,
    NzEmptyComponent,
    NzDescriptionsItemComponent,
    NzDescriptionsComponent,
    NzSpinComponent,
    NzCheckboxWrapperComponent,
    NzCheckboxGroupComponent,
    NzTabsModule,
    NzTabComponent,
    NzTabSetComponent,
    NzResultModule,
    PatientStatsComponent,
    DocumentAttachmentComponent
  ],
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patient$!: Observable<Patient | null>;
  loading = true;
  errorMessage = '';
  patientId: number = 0;
  includeTva: boolean = false;
  activeTab = 0;
  fabMenuOpen = false;


  constructor(
    private patientService: PatientService,
    private rdvService: RdvService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private pdfService: PdfService,
    private ordonnanceService: OrdonnanceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData(): void {
    this.loading = true;

    forkJoin({
      patient: this.patientService.getPatientById(this.patientId).pipe(
        catchError(err => {
          console.error('Erreur lors du chargement du patient', err);
          return of(null); // Retourne null en cas d'erreur
        })
      ),
      rdvs: this.rdvService.getRdvsByPatient(this.patientId).pipe(
        catchError(err => {
          console.error('Erreur lors du chargement des rendez-vous', err);
          return of([]); // Retourne un tableau vide en cas d'erreur
        })
      )
    }).pipe(
      map(({ patient, rdvs }) => {
        if (!patient) {
          throw new Error(`Patient avec ID ${this.patientId} non trouvé`);
        }
        return {
          ...patient,
          rendezVousList: rdvs
        };
      }),
      catchError(err => {
        this.errorMessage = `Impossible de charger les données du patient: ${err.message}`;
        this.loading = false;
        return of(null); // Retourne null en cas d'erreur
      })
    ).subscribe({
      next: (patientData) => {
        this.patient$ = of(patientData);
        this.loading = false;
      },
      error: (err) => {
        this.message.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  getStatusConfig(status: RdvStatus) {
    return RDV_STATUS_CONFIG[status];
  }

  onEditPatient(patient: Patient): void {
    this.router.navigate(['/doc/patients/edit', patient.id]);
/*
    this.closeFabMenu();
*/
  }

  onDeletePatient(patient: Patient): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer ${patient.titre || ''} ${patient.nom} ?`,
      nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.patientService.deletePatient(patient.id).subscribe({
          next: () => {
            this.message.success(`Patient "${patient.nom}" supprimé avec succès`);
            this.router.navigate(['/doc/patients']);
          },
          error: (err) => {
            this.message.error(`Erreur : ${err.message}`);
          }
        })
    });
/*
    this.closeFabMenu();
*/
  }

  onEditRdv(rdv: RendezVous): void {
    this.router.navigate(['/doc/rdv/edit', rdv.id]);
  }

  onDeleteRdv(rdv: RendezVous): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer ce rendez-vous ?`,
      nzContent: `Date: ${new Date(rdv.date).toLocaleDateString()}`,
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.rdvService.deleteRdv(rdv.id).subscribe({
          next: () => {
            this.message.success(`Rendez-vous supprimé avec succès`);
            this.loadPatientData();
          },
          error: (err) => {
            this.message.error(`Erreur : ${err.message}`);
          }
        })
    });
  }

  showOrdonnanceModal(rdv: RendezVous): void {
    if (!rdv.ordonnance) {
      this.message.warning('Aucune ordonnance disponible.');
      return;
    }

    // Créer un modal avec les informations de l'ordonnance et des boutons d'action
    const modal = this.modal.create({
      nzTitle: 'Ordonnance du patient',
      nzContent: `<div style="white-space: pre-wrap;">
        <p><strong>Date:</strong> ${new Date(rdv.date).toLocaleDateString()}</p>
        <p><strong>Contenu:</strong> ${rdv.ordonnance.contenu || 'Aucun contenu'}</p>
        ${rdv.ordonnance.remarques ? `<p><strong>Remarques:</strong> ${rdv.ordonnance.remarques}</p>` : ''}
      </div>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: [
        {
          label: 'Fermer',
          onClick: () => modal.destroy()
        },
        {
          label: 'Générer PDF',
          type: 'primary',
          onClick: () => {
            modal.destroy();
            this.generateOrdonnancePdf(rdv);
          }
        }
      ],
      nzWrapClassName: 'rapport-modal',
    });
  }

  // Nouvelle méthode pour générer une ordonnance PDF
  generateOrdonnancePdf(rdv: RendezVous): void {
    if (!rdv.ordonnance || !rdv.ordonnance.id) {
      this.message.warning('Aucune ordonnance disponible pour ce rendez-vous.');
      return;
    }

    this.loading = true;

    this.ordonnanceService.getOrdonnanceById(rdv.ordonnance.id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (ordonnance) => {
        try {
          // Si l'ordonnance n'a pas de rendezVous, on l'ajoute manuellement
          if (!ordonnance.rendezVous) {
            ordonnance.rendezVous = rdv;
          }

          // Assurons-nous que les informations patient et médecin sont disponibles
          if (!ordonnance.rendezVous.patient && rdv.patient) {
            ordonnance.rendezVous.patient = rdv.patient;
          }

          if (!ordonnance.rendezVous.medecin && rdv.medecin) {
            ordonnance.rendezVous.medecin = rdv.medecin;
          }

          this.pdfService.generateOrdonnancePdf(ordonnance)
            .then(() => {
              this.message.success('Ordonnance générée avec succès');
            })
            .catch((error: Error) => {
              this.message.error('Erreur lors de la génération de l\'ordonnance: ' + error.message);
              console.error('Erreur génération PDF:', error);
            });
        } catch (error) {
          this.message.error('Erreur lors de la génération de l\'ordonnance');
          console.error('Erreur génération PDF:', error);
        }
      },
      error: (err) => {
        this.message.error('Erreur lors de la récupération de l\'ordonnance');
        console.error('Erreur récupération ordonnance:', err);
      }
    });
  }

  showRapportModal(rdv: RendezVous): void {
    this.modal.create({
      nzTitle: 'Rapport de consultation',
      nzContent: `<p style="white-space: pre-wrap;">${rdv.rapport || 'Aucun rapport disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'rapport-modal',
    });
  }

  getAge(dateNaissance: string | Date): number {
    const birth = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  goBack(): void {
    this.router.navigate(['/doc/patients']);
  }

  addRdv(): void {
    this.router.navigate(['/doc/rdv/create'], {
      queryParams: { patientId: this.patientId }
    });
  }

  /*toggleFabMenu(): void {
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  closeFabMenu(): void {
    this.fabMenuOpen = false;
  }*/

  onTvaChange(e: any): void {
    this.includeTva = e.some((item: any) => item === 'tva');
  }

  generateFacture(rdv: RendezVous): void {
    try {
      this.pdfService.generateFacturePdf(rdv, this.includeTva);
      this.message.success('Facture générée avec succès');
    } catch (error) {
      this.message.error('Erreur lors de la génération de la facture');
      console.error(error);
    }
  }

  // Update the tab value directly, avoiding the event type issues
  handleTabChange(index: any): void {
    if (typeof index === 'number') {
      this.activeTab = index;
    }
  }

  generateAndShowOrdonnance(rdv: RendezVous): void {
    // TODO: Implémenter la génération d'ordonnance automatique
    this.message.info('Fonctionnalité en cours de développement');
  }

  onDocumentsUpdated(documents: Document[]): void {
    this.patient$ = this.patient$.pipe(
      map(patient => {
        if (patient && patient.dossierMedical) {
          return {
            ...patient,
            dossierMedical: {
              ...patient.dossierMedical,
              documents: documents
            }
          };
        }
        return patient;
      })
    );
  }
}
