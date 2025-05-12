import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {catchError, map, Observable, throwError, of, switchMap, forkJoin} from 'rxjs';

// Models
import { Patient } from '../../../models/patient.model';
import { RDV_STATUS_CONFIG, RdvStatus, RendezVous } from '../../../models/rdv.model';

// Services
import { PatientService } from '../../../service/patient.service';
import { RdvService } from '../../../service/rdv.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

// NG-ZORRO Components
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
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzResultModule } from 'ng-zorro-antd/result';
import { PdfService } from '../../../service/pdf.service';
import { NzCheckboxGroupComponent, NzCheckboxWrapperComponent } from 'ng-zorro-antd/checkbox';
import { PatientStatsComponent } from '../patient-stats/patient-stats.component';

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
    NzResultModule, // Ajout du module manquant
    PatientStatsComponent
  ],
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patient$!: Observable<null>;
  loading = true;
  errorMessage = '';
  patientId: number = 0;
  includeTva: boolean = false;
  activeTab = 0;

  constructor(
    private patientService: PatientService,
    private rdvService: RdvService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private pdfService: PdfService
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
    const ordonnance = rdv.ordonnance?.contenu || 'Aucune ordonnance disponible.';
    const remarques = rdv.ordonnance?.remarques ? `\n\nRemarques : ${rdv.ordonnance.remarques}` : '';

    this.modal.create({
      nzTitle: 'Ordonnance du patient',
      nzContent: `<p style="white-space: pre-wrap;">${ordonnance}${remarques}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'rapport-modal',
    });
  }

  generateAndShowOrdonnance(rdv: RendezVous): void {
    if (!rdv || !rdv.id) return;

    const defaultOrdonnance = {
      contenu: 'Contenu par défaut généré automatiquement.',
      remarques: '',
      archivee: false
    };

    this.patientService.createOrdonnance(rdv.id, defaultOrdonnance).subscribe({
      next: (ordonnance) => {
        rdv.ordonnance = ordonnance;
        this.showOrdonnanceModal(rdv);
      },
      error: (err) => {
        this.message.error('Erreur lors de la génération de lordonnance');
        console.error(err);
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

  // Correction de la méthode switchTab pour accepter un nombre au lieu d'un Event
  switchTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }
}
