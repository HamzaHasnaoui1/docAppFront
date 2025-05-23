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
import {Ordonnance} from '../../../models/ordonnance.model';
import {OrdonnanceService} from '../../../service/ordonnance.service';
import {Router, RouterModule} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SearchAddActionsComponent} from '../../../shared/search-add-actions/search-add-actions.component';
import {DirectivesModule} from '../../../directives/directives.module';
import {PdfService} from '../../../service/pdf.service';

@Component({
  selector: 'app-ordonnance-list',
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
    SearchAddActionsComponent,
    DirectivesModule,
    RouterModule
  ],
  templateUrl: './ordonnance-list.component.html',
  standalone: true,
  styleUrl: './ordonnance-list.component.scss'
})
export class OrdonnanceListComponent implements OnInit {
  ordonnances$!: Observable<any>;
  loading = false;
  pageIndex = 0;
  pageSize = 5;
  keyword = '';
  private searchSubject = new Subject<string>();

  constructor(
    private ordonnanceService: OrdonnanceService,
    private messageService: NzMessageService,
    private router: Router,
    private modalService: NzModalService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.keyword = keyword;
      this.pageIndex = 0;
      this.loadOrdonnances();
    });

    this.loadOrdonnances();
  }

  loadOrdonnances(): void {
    this.loading = true;
    this.ordonnances$ = this.ordonnanceService.getOrdonnances(this.pageIndex, this.keyword, this.pageSize).pipe(
      catchError(error => {
        this.messageService.error('Erreur lors du chargement des ordonnances');
        console.error('Erreur lors du chargement des ordonnances', error);
        this.loading = false;
        return of({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: this.pageSize,
          number: this.pageIndex
        });
      }),
      map(response => {
        this.loading = false;
        return response;
      })
    );
  }

  onPageChange(page: number): void {
    this.pageIndex = page - 1;
    this.loadOrdonnances();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 0;
    this.loadOrdonnances();
  }

  onSearchChange(keyword: string): void {
    this.searchSubject.next(keyword);
  }

  deleteOrdonnance(id: number): void {
    this.loading = true;
    this.ordonnanceService.deleteOrdonnance(id).subscribe({
      next: () => {
        this.messageService.success('Ordonnance supprimée avec succès');
        this.loadOrdonnances();
      },
      error: error => {
        this.messageService.error('Erreur lors de la suppression de l\'ordonnance');
        console.error('Erreur lors de la suppression de l\'ordonnance', error);
        this.loading = false;
      }
    });
  }

  generatePdf(ordonnance: Ordonnance): void {
    if (!ordonnance.id) {
      this.messageService.warning('Impossible de générer le PDF pour cette ordonnance');
      return;
    }

    this.loading = true;
    this.ordonnanceService.getOrdonnanceById(ordonnance.id).subscribe({
      next: (detailedOrdonnance) => {
        this.pdfService.generateOrdonnancePdf(detailedOrdonnance)
          .then(() => {
            this.messageService.success('PDF généré avec succès');
            this.loading = false;
          })
          .catch(error => {
            this.messageService.error('Erreur lors de la génération du PDF');
            console.error('Erreur lors de la génération du PDF', error);
            this.loading = false;
          });
      },
      error: error => {
        this.messageService.error('Erreur lors de la récupération des détails de l\'ordonnance');
        console.error('Erreur lors de la récupération des détails de l\'ordonnance', error);
        this.loading = false;
      }
    });
  }
}
