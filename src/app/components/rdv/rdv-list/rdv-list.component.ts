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
  templateUrl: './rdv-list.component.html',
  styleUrl: './rdv-list.component.scss'
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
