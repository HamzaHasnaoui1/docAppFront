import { Component, OnInit } from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../service/patient.service';
import { catchError, map, Observable, throwError, of, switchMap, Subject, forkJoin } from 'rxjs';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { ActivatedRoute, Router } from '@angular/router';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputGroupComponent } from 'ng-zorro-antd/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchAddActionsComponent } from '../../../shared/search-add-actions/search-add-actions.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { RDV_STATUS_CONFIG, RdvStatus, RendezVous } from '../../../models/rdv.model';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzDescriptionsComponent, NzDescriptionsItemComponent } from 'ng-zorro-antd/descriptions';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { RdvService } from '../../../service/rdv.service';
import {PatientWithRdvs} from '../../../models/PatientWithRdvs.model';
import {NzListComponent, NzListItemComponent, NzListItemMetaComponent, NzListModule} from 'ng-zorro-antd/list';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {NzSpinComponent} from "ng-zorro-antd/spin";

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
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
        NzCollapsePanelComponent,
        NzCollapseComponent,
        NzEmptyComponent,
        NzDescriptionsItemComponent,
        NzDescriptionsComponent,
        NzSelectComponent,
        NzOptionComponent,
        NzListComponent,
        NzListItemComponent,
        NzListItemMetaComponent,
        NzListModule,
        NzAvatarComponent,
        NzSpinComponent
    ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(-20px)',
            background: 'transparent'
          }),
          stagger('50ms', [
            animate('300ms ease-out',
              style({
                opacity: 1,
                transform: 'translateY(0)',
                background: 'transparent'
              }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class PatientListComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;
  deletedIds: number[] = [];
  searchTerm$ = new Subject<string>();
  totalPagesArray: number[] = [];
  loading: boolean = true;
  searchKeyword: string = '';

  constructor(
    private patientService: PatientService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadPage(0);
    this.loading = false;
  }

  private setupSearch(): void {
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.searchKeyword = keyword;
      this.loadPage(0, keyword);
    });
  }

  loadPage(page: number, keyword: string = this.searchKeyword): void {
    this.loading = true;
    this.errorMessage = '';

    this.patientService.getPatients(page, keyword, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return of({ patients: [], totalPages: 0, currentPage: 0 });
      })
    ).subscribe(response => {
      this.patients$ = of(response.patients);
      this.totalPages = response.totalPages;
      this.currentPage = response.currentPage;
      this.initPagesArray();
      this.loading = false;
    });
  }

  onSearch(keyword: string): void {
    this.searchTerm$.next(keyword);
  }

  animateRemoval(id: number): void {
    this.deletedIds.push(id);
    setTimeout(() => {
      this.loadPage(this.currentPage);
      this.deletedIds = this.deletedIds.filter(x => x !== id);
    }, 400);
  }

  getAge(dateNaissance: string | Date): number {
    if (!dateNaissance) return 0;
    const birth = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  navigateToDetails(patientId: number): void {
    this.router.navigate(['/doc/patients/detail', patientId]);
  }

  showPhoneModal(p: any): void {
    this.modal.create({
      nzTitle: `Numéro de téléphone de ${p.nom}`,
      nzContent: `<p style="white-space: pre-wrap;">${p.numeroTelephone || 'Aucun Numero disponible.'}</p>`,
      nzClosable: true,
      nzWidth: 600,
      nzFooter: null,
      nzWrapClassName: 'phone-modal',
    });
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onAdd(): void {
    this.router.navigate(['/doc/patients/create']);
  }

  initPagesArray(): void {
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage = pageIndex;
      this.loadPage(pageIndex);
    }
  }
}
