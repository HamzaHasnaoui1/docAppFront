import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";
import {NzAlertComponent, NzAlertModule} from "ng-zorro-antd/alert";
import {NzButtonComponent, NzButtonModule} from "ng-zorro-antd/button";
import {NzCardComponent, NzCardModule} from "ng-zorro-antd/card";
import {NzIconDirective, NzIconModule} from "ng-zorro-antd/icon";
import {
  NzTableCellDirective,
  NzTableComponent, NzTableModule,
  NzTbodyComponent,
  NzTheadComponent,
  NzThMeasureDirective, NzTrDirective
} from "ng-zorro-antd/table";
import {NzTagComponent, NzTagModule} from "ng-zorro-antd/tag";
import {NzWaveDirective} from "ng-zorro-antd/core/wave";
import {catchError, map, Observable, of, Subject, switchMap} from 'rxjs';
import {Medecin} from '../../../models/medecin.model';
import {MedecinService} from '../../../service/medecin.service';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzTooltipDirective, NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NzInputGroupComponent} from "ng-zorro-antd/input";
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {SearchAddActionsComponent} from '../../../shared/search-add-actions/search-add-actions.component';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NzEmptyComponent} from "ng-zorro-antd/empty";
import {NzSpinComponent} from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-medecin-list',
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
    NzInputGroupComponent,
    ReactiveFormsModule,
    NzModalModule,
    SearchAddActionsComponent,
    NzSelectComponent,
    NzOptionComponent,
    NzEmptyComponent,
    NzSpinComponent,

  ],
  templateUrl: './medecin-list.component.html',
  standalone: true,
  styleUrl: './medecin-list.component.scss'
})
export class MedecinListComponent implements OnInit{
  medecins$!: Observable<Medecin[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  deletedIds: number[] = [];
  searchTerm$ = new Subject<string>();
  totalPagesArray: number[] = [];
  isLoading = false;

  constructor(private medecinService: MedecinService, private router: Router, private message: NzMessageService,
              private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.setupSearch();
    this.loadPage(0);
  }

  private setupSearch(): void {
    this.isLoading = true; // Ajoutez cette ligne
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(keyword =>
        this.medecinService.getMedecins(0, keyword).pipe(
          catchError(err => {
            this.errorMessage = err.message;
            this.isLoading = false;
            return of({ medecins: [], totalPages: 0, currentPage: 0 });
          })
        )
      )
    ).subscribe(response => {
      this.medecins$ = of(response.medecins);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
      this.isLoading = false;
    });
  }

  onSearch(keyword: string): void {
    this.searchTerm$.next(keyword);
  }


  loadPage(page: number): void {
    this.isLoading = true;
    this.medecinService.getMedecins(page).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        this.isLoading = false;
        return of({medecins: [], totalPages: 0, currentPage: 0});
      })
    ).subscribe(response => {
      this.medecins$ = of(response.medecins);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
      this.isLoading = false;
    });
  }


  onEdit(medecin: Medecin): void {
    this.router.navigate(['/doc/medecin/edit', medecin.id]);
  }

  onDelete(medecin: Medecin): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer ${medecin.nom}  ?`,
      //nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.medecinService.deleteMedecin(medecin.id).subscribe({
          next: () => {
            this.message.success(`Medecin "${medecin.nom}" supprimé avec succès`);
            this.animateRemoval(medecin.id);
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

  onAdd() {
    this.router.navigate(['/doc/medecin/create']);
  }

  prevPage(): void {
    if (this.currentPage > 0) this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadPage(this.currentPage + 1);
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage = pageIndex;
      this.loadPage(pageIndex);
    }
  }

  showPhoneModal(m: Medecin) {
    this.modal.create({
      nzTitle: 'Numero du medecin',
      nzContent: `<p style="white-space: pre-wrap;">${m.numeroTelephone || 'Aucun Numero disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'phone-modal',
    });
  }
}

