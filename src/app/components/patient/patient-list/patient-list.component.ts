import { Component, OnInit } from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../service/patient.service';
import {catchError, map, Observable, throwError, of, switchMap, Subject} from 'rxjs';
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
import {NzInputGroupComponent} from 'ng-zorro-antd/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SearchAddActionsComponent} from '../../../shared/search-add-actions/search-add-actions.component';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';


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
    NzToolTipModule,
    NzInputGroupComponent,
    FormsModule,
    ReactiveFormsModule,
    SearchAddActionsComponent,
    NzModalModule,
  ],
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  deletedIds: number[] = [];
  searchTerm$ = new Subject<string>();

  constructor(
    private patientService: PatientService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadPage(0);
  }

  private setupSearch(): void {
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword =>
        this.patientService.getPatients(0, keyword).pipe(
          catchError(err => {
            this.errorMessage = err.message;
            return of({ patients: [], totalPages: 0, currentPage: 0 });
          })
        )
      )
    ).subscribe(response => {
      this.patients$ = of(response.patients);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
    });
  }

  onSearch(keyword: string): void {
    this.searchTerm$.next(keyword);
  }

  loadPage(page: number): void {
    this.patientService.getPatients(page).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return of({patients: [], totalPages: 0, currentPage: 0});
      })
    ).subscribe(response => {
      this.patients$ = of(response.patients);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
    });

  }
  onEdit(patient: Patient): void {
    this.router.navigate(['/doc/patients/edit', patient.id]);
  }

  onDelete(patient: Patient): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer ${patient.titre || ''} ${patient.nom} ?`,
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

  showPhoneModal(p: any): void {
    this.modal.create({
      nzTitle: 'Numero du patient',
      nzContent: `<p style="white-space: pre-wrap;">${p.numeroTelephone || 'Aucun Numero disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'phone-modal',
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
