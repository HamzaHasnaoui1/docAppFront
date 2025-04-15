import { Component, OnInit } from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../service/patient.service';
import { catchError, map, Observable, throwError, of } from 'rxjs';
import {AsyncPipe, CommonModule, DatePipe} from '@angular/common';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {ActivatedRoute, Router} from '@angular/router';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';


@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
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
    NzToolTipModule
  ],
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;

  constructor(private patientService: PatientService , private router: Router, private message: NzMessageService,
              private modal: NzModalService

  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.patients$ = this.patientService.getPatients(page).pipe(
      map((response: any) => {
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        return response.patients;
      }),
      catchError(err => {
        this.errorMessage = err.message;
        return of([]);
      })
    );
  }


  onEdit(patient: Patient): void {
    this.router.navigate(['/doc/patients/edit', patient.id]);
  }

  onDelete(patient: Patient): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer ${patient.titre} ${patient.nom} ?`,
      //nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.patientService.deletePatient(patient.id).subscribe({
          next: () => {
            this.message.success(`Patient "${patient.nom}" supprimé avec succès`);
            this.animateRemoval(patient.id);
          },
          error: (err) => {
            this.message.error(`Erreur : ${err.message}`);
          }
        })
    });
  }

  deletedIds: number[] = [];

  animateRemoval(id: number): void {
    this.deletedIds.push(id);
    setTimeout(() => {
      this.loadPage(this.currentPage);
      this.deletedIds = this.deletedIds.filter(x => x !== id);
    }, 400);
  }

  showRapportModal(p: any): void {
    this.modal.create({
      nzTitle: 'Rapport du patient',
      nzContent: `<p style="white-space: pre-wrap;">${p.rapport || 'Aucun rapport disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'rapport-modal',
    });
  }

  prevPage(): void {
    if (this.currentPage > 0) this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadPage(this.currentPage + 1);
  }


  onAdd() {
    this.router.navigate(['/doc/patients/create']);
  }
}
