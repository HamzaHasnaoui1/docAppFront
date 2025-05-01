import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, Observable, throwError, of, switchMap } from 'rxjs';

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
    NzSpinComponent
  ],
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patient$!: Observable<Patient>;
  loading = true;
  errorMessage = '';
  patientId: number = 0;

  constructor(
    private patientService: PatientService,
    private rdvService: RdvService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData(): void {
    this.loading = true;

    // Récupération du patient par son ID
    this.patientService.getPatientById(this.patientId).pipe(
      switchMap(patient => {
        // Une fois le patient récupéré, on obtient tous les RDVs
        return this.rdvService.getRdvs().pipe(
          map(response => {
            // Filtrer les RDVs pour ne garder que ceux du patient actuel
            const patientRdvs = response.rdvs.filter((rdv: { patient: { id: number; }; }) => rdv.patient.id === this.patientId);
            return { ...patient, rendezVousList: patientRdvs };
          })
        );
      }),
      catchError(err => {
        this.errorMessage = `Impossible de charger les données du patient: ${err.message}`;
        this.loading = false;
        return throwError(() => new Error(this.errorMessage));
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
            this.loadPatientData(); // Reload data to update the list
          },
          error: (err) => {
            this.message.error(`Erreur : ${err.message}`);
          }
        })
    });
  }

  showOrdonnanceModal(rdv: RendezVous): void {
    this.modal.create({
      nzTitle: 'Ordonnance du patient',
      nzContent: `<p style="white-space: pre-wrap;">${rdv.ordonnance || 'Aucune ordonnance disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'rapport-modal',
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
}
