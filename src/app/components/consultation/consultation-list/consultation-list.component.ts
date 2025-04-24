import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, DatePipe} from '@angular/common';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {catchError, map, Observable, of, Subject, switchMap} from 'rxjs';
import {Consultation} from '../../../models/consultation.model';
import {ConsultationService} from '../../../service/consultation.service';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {RDV_STATUS_CONFIG, RdvStatus} from '../../../models/rdv.model';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SearchAddActionsComponent} from '../../../shared/search-add-actions/search-add-actions.component';

@Component({
  selector: 'app-consultation-list',
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
    SearchAddActionsComponent
  ],
  templateUrl: './consultation-list.component.html',
  standalone: true,
  styleUrl: './consultation-list.component.scss'
})
export class ConsultationListComponent implements OnInit{
  consultation$!: Observable<Consultation[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  searchTerm$ = new Subject<string>();


  constructor(private consultationService:ConsultationService, private router: Router, private message: NzMessageService,
            private modal: NzModalService) {}

  ngOnInit(): void {
    this.setupSearch();
  this.loadPage(0);
  }

  private setupSearch(): void {
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword =>
        this.consultationService.getConsultation(0, keyword).pipe(
          catchError(err => {
            this.errorMessage = err.message;
            return of({ consultations: [], totalPages: 0, currentPage: 0 });
          })
        )
      )
    ).subscribe(response => {
      this.consultation$ = of(response.consultations);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
    });
  }

  onSearch(keyword: string): void {
    this.searchTerm$.next(keyword);
  }

  private loadPage(page: number) {
    this.consultation$=this.consultationService.getConsultation(page).pipe(
      map((response: any) => {
        this.totalPages=response.totalPages;
        this.currentPage=response.currentPage;
        return response.consultations;
      }),
      catchError(err => {
        this.errorMessage=err.message;
        return of([])
      })
    )
  }

  onEdit(consultaion: Consultation): void {
  this.router.navigate(['/doc/consultations/edit', consultaion.id]);
  }

  onDelete(consultation: Consultation): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer la consultation du ${consultation.rendezVous.patient}  ?`,
      //nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.consultationService.deleteConsultation(consultation.id).subscribe({
          next: () => {
            this.message.success(`Consultation numero "${consultation.id}" supprimé avec succès`);
            this.animateRemoval(consultation.id);
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

  onAdd() {
    this.router.navigate(['/doc/consultations/create']);
  }

  showRapportModal(c: any): void {
    this.modal.create({
      nzTitle: 'Rapport du patient',
      nzContent: `<p style="white-space: pre-wrap;">${c.rapport || 'Aucun rapport disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'rapport-modal',
    });
  }

  showOrdonnanceModal(c: any): void {
    this.modal.create({
      nzTitle: 'Ordonnance du patient',
      nzContent: `<p style="white-space: pre-wrap;">${c.ordonnance || 'Aucune ordonnance disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'rapport-modal',
    });
  }

  getStatusConfig(status: RdvStatus) {
    return RDV_STATUS_CONFIG[status];
  }

  prevPage(): void {
    if (this.currentPage > 0) this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadPage(this.currentPage + 1);
  }
}
