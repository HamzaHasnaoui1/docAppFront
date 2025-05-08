import { Component, OnInit } from '@angular/core';
import {
  AsyncPipe,
  CommonModule,
  DatePipe,
  NgForOf,
  NgIf
} from '@angular/common';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { MedicamentService } from '../../../service/medicament.service';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputGroupComponent } from 'ng-zorro-antd/input';
import { SearchAddActionsComponent } from '../../../shared/search-add-actions/search-add-actions.component';
import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { Medicament } from '../../../models/Medicament.model';

@Component({
  selector: 'app-medicament-list',
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
    NzInputGroupComponent,
    SearchAddActionsComponent,
    NzSelectComponent,
    NzOptionComponent,
    NzEmptyComponent,
    NzSpinComponent
  ],
  templateUrl: './medicament-list.component.html',
  styleUrl: './medicament-list.component.scss'
})
export class MedicamentListComponent implements OnInit {
  medicaments$!: Observable<Medicament[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  deletedIds: number[] = [];
  searchTerm$ = new Subject<string>();
  totalPagesArray: number[] = [];
  isLoading = false;

  constructor(private medicamentService: MedicamentService,
              private router: Router,
              private message: NzMessageService,
              private modal: NzModalService) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadPage(0);
  }

  private setupSearch(): void {
    this.isLoading = true;
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword =>
        this.medicamentService.getMedicaments(0, keyword).pipe(
          catchError(err => {
            this.errorMessage = err.message;
            this.isLoading = false;
            return of({ medicaments: [], totalPages: 0, currentPage: 0 });
          })
        )
      )
    ).subscribe(response => {
      this.medicaments$ = of(response.medicaments);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
      this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.isLoading = false;
    });
  }

  onSearch(keyword: string): void {
    this.searchTerm$.next(keyword);
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.medicamentService.getMedicaments(page).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        this.isLoading = false;
        return of({ medicaments: [], totalPages: 0, currentPage: 0 });
      })
    ).subscribe(response => {
      this.medicaments$ = of(response.medicaments);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
      this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.isLoading = false;
    });
  }

  onEdit(m: Medicament): void {
    this.router.navigate(['/doc/medicament/edit', m.id]);
  }

  onDelete(m: Medicament): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer ${m.nom} ?`,
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.medicamentService.deleteMedicament(m.id).subscribe({
          next: () => {
            this.message.success(`Médicament "${m.nom}" supprimé avec succès`);
            this.animateRemoval(m.id);
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

  onAdd(): void {
    this.router.navigate(['/doc/medicament/create']);
  }

  prevPage(): void {
    if (this.currentPage > 0) this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadPage(this.currentPage + 1);
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.loadPage(pageIndex);
    }
  }
}
