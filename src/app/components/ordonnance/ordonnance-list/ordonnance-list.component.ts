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
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SearchAddActionsComponent} from '../../../shared/search-add-actions/search-add-actions.component';

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
    SearchAddActionsComponent
  ],
  templateUrl: './ordonnance-list.component.html',
  standalone: true,
  styleUrl: './ordonnance-list.component.scss'
})
export class OrdonnanceListComponent implements OnInit {
  ordonnance$!: Observable<Ordonnance[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  deletedIds: number[] = [];
  searchTerm$ = new Subject<string>();

  constructor(private ordonnaceService : OrdonnanceService , private router: Router, private message: NzMessageService,
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
        this.ordonnaceService.getOrdonnances(0, keyword).pipe(
          catchError(err => {
            this.errorMessage = err.message;
            return of({ ordonnances: [], totalPages: 0, currentPage: 0 });
          })
        )
      )
    ).subscribe(response => {
      this.ordonnance$ = of(response.ordonnances);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
    });
  }

  onSearch(keyword: string): void {
    this.searchTerm$.next(keyword);
  }

  private loadPage(page:number){
  this.ordonnance$ = this.ordonnaceService.getOrdonnances(page).pipe(
    map((response:any)=>{
      this.totalPages=response.totalPages;
      this.currentPage=response.currentPage;
      return response.ordonnances;
    }),
    catchError(err => {
      this.errorMessage=err.message;
      return of([]);
    })
  )
  }

  onAdd() {
    this.router.navigate(['/doc/ordonnance/create']);
  }

  onEdit(ordonnance: Ordonnance): void {
    this.router.navigate(['/doc/ordonnance/edit', ordonnance.id]);
  }

  onDelete(ordonnance: Ordonnance): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer l'ordonnance  ${ordonnance}  ?`,
      //nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.ordonnaceService.deleteOrdonnance(ordonnance.id).subscribe({
          next: () => {
            this.message.success(`Ordonnance numero "${ordonnance.id}" supprimé avec succès`);
            this.animateRemoval(ordonnance.id);
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

  prevPage(): void {
    if (this.currentPage > 0) this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadPage(this.currentPage + 1);
  }
}
