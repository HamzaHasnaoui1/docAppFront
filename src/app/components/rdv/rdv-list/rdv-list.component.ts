import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule, DatePipe} from '@angular/common';
import {NzAlertComponent, NzAlertModule} from 'ng-zorro-antd/alert';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import {NzCardComponent, NzCardModule} from 'ng-zorro-antd/card';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {
  NzTableCellDirective,
  NzTableComponent, NzTableModule,
  NzTbodyComponent,
  NzTheadComponent,
  NzThMeasureDirective, NzTrDirective
} from 'ng-zorro-antd/table';
import {NzTagComponent, NzTagModule} from 'ng-zorro-antd/tag';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {catchError, map, Observable, of} from 'rxjs';
import {Patient} from '../../../models/patient.model';
import {RDV_STATUS_CONFIG, RdvStatus, RendezVous} from '../../../models/rdv.model';
import {RdvService} from '../../../service/rdv.service';
import {NzTooltipDirective, NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';

@Component({
  selector: 'app-rdv-list',
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
  templateUrl: './rdv-list.component.html',
  standalone: true,
  styleUrl: './rdv-list.component.scss'
})
export class RdvListComponent implements OnInit{
  rdv$!: Observable<RendezVous[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;

  constructor(private rdvService: RdvService, private router: Router, private message: NzMessageService,
              private modal: NzModalService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.rdv$ = this.rdvService.getRdvs(page).pipe(
      map((response: any) => {
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        return response.rdvs;
      }),
      catchError(err => {
        this.errorMessage = err.message;
        return of([]);
      })
    );
  }
  prevPage(): void {
    if (this.currentPage > 0) this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadPage(this.currentPage + 1);
  }

  getStatusConfig(status: RdvStatus) {
    return RDV_STATUS_CONFIG[status];
  }

  onEdit(rdv: RendezVous): void {
    this.router.navigate(['/doc/rdv/edit', rdv.id]);
  }

  onDelete(rdv: RendezVous): void {
    this.modal.confirm({
      nzTitle: `Voulez-vous supprimer rendez-vous du Patient : ${rdv.patient}  ?`,
      //nzContent: 'Cette action est irréversible.',
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () =>
        this.rdvService.deleteRdv(rdv.id).subscribe({
          next: () => {
            this.message.success(`RDV du Patient :"${rdv.patient.nom}" supprimé avec succès`);
            this.animateRemoval(rdv.id);
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
}
