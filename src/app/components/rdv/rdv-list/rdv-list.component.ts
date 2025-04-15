import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzAlertComponent} from 'ng-zorro-antd/alert';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {
  NzTableCellDirective,
  NzTableComponent,
  NzTbodyComponent,
  NzTheadComponent,
  NzThMeasureDirective, NzTrDirective
} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {catchError, map, Observable, of} from 'rxjs';
import {Patient} from '../../../models/patient.model';
import {RDV_STATUS_CONFIG, RdvStatus, RendezVous} from '../../../models/rdv.model';
import {RdvService} from '../../../service/rdv.service';

@Component({
  selector: 'app-rdv-list',
  imports: [CommonModule, NzAlertComponent, NzButtonComponent, NzCardComponent, NzIconDirective, NzTableCellDirective, NzTableComponent, NzTagComponent, NzTbodyComponent, NzThMeasureDirective, NzTheadComponent, NzTrDirective, NzWaveDirective],
  templateUrl: './rdv-list.component.html',
  standalone: true,
  styleUrl: './rdv-list.component.scss'
})
export class RdvListComponent implements OnInit{
  rdv$!: Observable<RendezVous[]>;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;

  constructor(private rdvService: RdvService) {}

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
}
