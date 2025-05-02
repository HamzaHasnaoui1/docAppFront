import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, map, Observable, of } from 'rxjs';
import { RDV_STATUS_CONFIG, RendezVous } from '../../../models/rdv.model';
import { RdvService } from '../../../service/rdv.service';

@Component({
  selector: 'app-list-calendar',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    DatePipe
  ],
  template: `
    <nz-card nzTitle="Calendrier Hebdomadaire">
      <div class="controls">
        <button nz-button nzType="default" (click)="previousWeek()">
          <i nz-icon nzType="left"></i> Semaine précédente
        </button>
        <h3>{{ weekStart | date:'d MMMM yyyy' }} - {{ weekEnd | date:'d MMMM yyyy' }}</h3>
        <button nz-button nzType="default" (click)="nextWeek()">
          Semaine suivante <i nz-icon nzType="right"></i>
        </button>
      </div>

      <div class="week-view">
        <div *ngFor="let day of weekDays" class="day-column">
          <div class="day-header">
            {{ day | date:'EEEE d' | titlecase }}
          </div>
          <div class="rdv-container">
            <div *ngFor="let rdv of getDayRdvs(day)"
                 class="rdv-card"
                 [style.border-left]="'4px solid ' + getStatusColor(rdv.statusRDV)"
                 (click)="viewDetails(rdv)">
              <div class="rdv-time">{{ formatTime(rdv.date) }}</div>
              <div class="rdv-details">
                <div class="patient">{{ rdv.patient?.nom || 'N/A' }}</div>
                <div class="doctor">{{ rdv.medecin?.specialite || 'Spécialité inconnue' }}</div>
              </div>
              <nz-tag [nzColor]="getStatusColor(rdv.statusRDV)">
                {{ getStatusLabel(rdv.statusRDV) }}
              </nz-tag>
            </div>
          </div>
        </div>
      </div>
    </nz-card>
  `,
  styles: [`
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 0 16px;
    }

    .week-view {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 8px;
    }

    .day-column {
      min-width: 240px;
      background: #fafafa;
      border-radius: 8px;
    }

    .day-header {
      padding: 12px;
      background: #1890ff;
      color: white;
      font-weight: bold;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }

    .rdv-container {
      padding: 8px;
      min-height: 120px;
    }

    .rdv-card {
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      gap: 8px;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .rdv-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .rdv-time {
      font-weight: bold;
      color: #1890ff;
      min-width: 50px;
    }

    .rdv-details {
      flex: 1;
    }

    .patient {
      font-weight: 500;
    }

    .doctor {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class RdvListComponent implements OnInit {
  allRdvs: RendezVous[] = [];
  weekDays: Date[] = [];
  weekStart: Date = new Date();
  weekEnd: Date = new Date();

  constructor(
    private rdvService: RdvService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadAllRdvs();
    this.initWeekDays();
  }

  loadAllRdvs(): void {
    this.rdvService.getAllRdvs().pipe(
      map((response: RendezVous[]) => response), // Supprime le mapping de .rdvs car l'API retourne directement le tableau
      catchError(err => {
        this.message.error('Erreur de chargement des rendez-vous');
        return of([]);
      })
    ).subscribe(rdvs => {
      this.allRdvs = rdvs;
      console.log('Rendez-vous chargés:', this.allRdvs); // Debug
    });
  }

  initWeekDays(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Lundi comme premier jour

    this.weekStart = new Date(today.setDate(diff));
    this.weekEnd = new Date(this.weekStart);
    this.weekEnd.setDate(this.weekStart.getDate() + 6);

    this.generateWeekDays();
  }

  generateWeekDays(): void {
    this.weekDays = [];
    const currentDate = new Date(this.weekStart);

    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      this.weekDays.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log('Jours de la semaine:', this.weekDays); // Debug
  }

  previousWeek(): void {
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.weekEnd.setDate(this.weekEnd.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek(): void {
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.weekEnd.setDate(this.weekEnd.getDate() + 7);
    this.generateWeekDays();
  }

  getDayRdvs(day: Date): RendezVous[] {
    if (!this.allRdvs || this.allRdvs.length === 0) return [];

    const dayRdvs = this.allRdvs.filter(rdv => {
      if (!rdv?.date) return false;

      const rdvDate = new Date(rdv.date);
      const compareDate = new Date(day);

      return rdvDate.getFullYear() === compareDate.getFullYear() &&
        rdvDate.getMonth() === compareDate.getMonth() &&
        rdvDate.getDate() === compareDate.getDate();
    }).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    console.log(`RDVs pour ${day.toDateString()}:`, dayRdvs); // Debug
    return dayRdvs;
  }

  formatTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }

  getStatusColor(status: string): string {
    return RDV_STATUS_CONFIG[status as keyof typeof RDV_STATUS_CONFIG]?.color || 'gray';
  }

  getStatusLabel(status: string): string {
    return RDV_STATUS_CONFIG[status as keyof typeof RDV_STATUS_CONFIG]?.label || status;
  }

  viewDetails(rdv: RendezVous): void {
    this.router.navigate(['/doc/patients/detail', rdv.patient?.id]);
  }
}
