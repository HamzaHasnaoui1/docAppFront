import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import {Router, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

// Services de l'application
import { PatientService } from '../../service/patient.service';
import { RdvService } from '../../service/rdv.service';
import { MedecinService } from '../../service/medecin.service';

// Modèles de l'application
import { Patient } from '../../models/patient.model';
import { RendezVous, RDV_STATUS_CONFIG } from '../../models/rdv.model';
import { Medecin } from '../../models/medecin.model';

// RxJS
import { forkJoin, of, catchError } from 'rxjs';
import {NzProgressComponent} from 'ng-zorro-antd/progress';
import {NzSpinComponent} from 'ng-zorro-antd/spin';

// Interface pour les données de graphique
interface ChartData {
  name: string;
  value: number;
  height: number; // Pourcentage de hauteur pré-calculé pour le graphique
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzTableModule,
    NzIconModule,
    NzTagModule,
    NzButtonModule,
    NzEmptyModule,
    NzCalendarModule,
    NzToolTipModule,
    NzAlertModule,
    NzTabsModule,
    NzBadgeModule,
    NzSelectModule,
    RouterModule,
    FormsModule,
    NzProgressComponent,
    NzSpinComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Propriété pour déterminer le rôle de l'utilisateur
  userRole: 'MEDECIN' | 'SECRETAIRE' = 'MEDECIN'; // Valeur par défaut
  today: Date = new Date();

  // Données partagées entre médecin et secrétaire
  totalPatients: number = 0;
  totalAppointments: number = 0;
  todayAppointments: RendezVous[] = [];

  // Pour l'affichage du médecin
  patientsThisMonth: number = 0;
  upcomingAppointments: number = 0;
  patientsByMonth: ChartData[] = [];
  revenueByMonth: ChartData[] = [];
  recentPatients: Patient[] = [];
  frequentPatients: any[] = [];

  // Pour l'affichage de la secrétaire
  pendingAppointmentsCount: number = 0;
  confirmedAppointmentsCount: number = 0;
  todayAppointmentsCount: number = 0;
  pendingAppointments: RendezVous[] = [];
  medecinsAvailable: Medecin[] = [];
  nextPatients: Patient[] = [];
  selectedMedecinId: number | null = null;

  // État de chargement
  loading: boolean = true;
  loadingPatients: boolean = true;
  loadingAppointments: boolean = true;
  loadingMedecins: boolean = true;

  rdvsByMonth: ChartData[] = [];

  constructor(
    private patientService: PatientService,
    private rdvService: RdvService,
    private medecinService: MedecinService,
    private message: NzMessageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // En production, le rôle viendrait d'un service d'authentification
    // this.userRole = this.authService.getUserRole();

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Utiliser forkJoin pour charger plusieurs sources de données en parallèle
    forkJoin({
      patients: this.patientService.getPatients(0, "").pipe(catchError(err => {
        this.message.error("Erreur lors du chargement des patients");
        return of({ patients: [], totalPages: 0 });
      })),
      appointments: this.rdvService.getRdvsMedecin().pipe(catchError(err => {
        this.message.error("Erreur lors du chargement des rendez-vous");
        return of({ rdvs: [] });
      })),
      medecins: this.medecinService.getMedecins(0).pipe(catchError(err => {
        this.message.error("Erreur lors du chargement des médecins");
        return of({ medecins: [], totalPages: 0, currentPage: 0 });
      }))
    }).subscribe(results => {
      // Patients
      const patients = results.patients.patients || [];
      this.totalPatients = patients.length;

      // Récents patients (5 derniers)
      this.recentPatients = patients.slice(0, 5);

      // Rendez-vous - dans le cas de getRdvsMedecin(), la réponse est directement un tableau
      const appointments = Array.isArray(results.appointments)
        ? results.appointments
        : (results.appointments.rdvs || []);
      this.totalAppointments = appointments.length;

      // Médecins
      const medecins = results.medecins.medecins || [];
      this.medecinsAvailable = medecins;

      // Rendez-vous d'aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.todayAppointments = appointments.filter((rdv: RendezVous) => {
        const rdvDate = new Date(rdv.date);
        rdvDate.setHours(0, 0, 0, 0);
        return rdvDate.getTime() === today.getTime();
      });

      this.todayAppointmentsCount = this.todayAppointments.length;

      // Rendez-vous en attente (PENDING ou EN_ATTENTE)
      this.pendingAppointments = appointments.filter((rdv: RendezVous) =>
        rdv.statusRDV === 'PENDING'
      );
      this.pendingAppointmentsCount = this.pendingAppointments.length;

      // Rendez-vous confirmés
      this.confirmedAppointmentsCount = appointments.filter((rdv: RendezVous) =>
        rdv.statusRDV === 'CONFIRMED'
      ).length;

      // Rendez-vous à venir
      const now = new Date();
      const upcomingRdvs = appointments.filter((rdv: RendezVous) => new Date(rdv.date) > now);
      this.upcomingAppointments = upcomingRdvs.length;

      // Prochains patients (aujourd'hui et demain)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59);

      // Prendre les rendez-vous entre maintenant et demain soir
      const nextAppointments = appointments.filter((rdv: RendezVous) => {
        const rdvDate = new Date(rdv.date);
        return rdvDate >= now && rdvDate <= tomorrow;
      });

      // Extraire les patients de ces rendez-vous
      const patientIds = new Set();
      this.nextPatients = nextAppointments
        .filter((rdv: RendezVous) => {
          // Filtrer les duplications
          if (patientIds.has(rdv.patient?.id)) return false;
          if (rdv.patient?.id) patientIds.add(rdv.patient.id);
          return rdv.patient !== null;
        })
        .map((rdv: RendezVous) => rdv.patient)
        .slice(0, 5); // Limiter à 5

      // Patients du mois en cours pour le médecin
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      this.patientsThisMonth = appointments.filter((rdv: RendezVous) => {
        const rdvDate = new Date(rdv.date);
        return rdvDate.getMonth() === currentMonth && rdvDate.getFullYear() === currentYear;
      }).length;

      // Patients fréquents pour le médecin (comptage des rendez-vous par patient)
      const patientAppointments = new Map();

      appointments.forEach((rdv: RendezVous) => {
        if (rdv.patient && rdv.patient.id) {
          const patientId = rdv.patient.id;
          if (!patientAppointments.has(patientId)) {
            patientAppointments.set(patientId, {
              patient: rdv.patient,
              count: 0
            });
          }
          patientAppointments.get(patientId).count++;
        }
      });

      this.frequentPatients = Array.from(patientAppointments.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Générer les données pour les graphiques du médecin
      this.generateChartData(appointments);

      // Terminer le chargement
      this.loading = false;
      this.loadingPatients = false;
      this.loadingAppointments = false;
      this.loadingMedecins = false;
    });
  }

// Initialise un tableau avec les 6 derniers mois
  private initializeLastSixMonths(): {
    name: string,
    month: number,
    year: number,
    rdvCount: number,
    revenue: number
  }[] {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('fr-FR', { month: 'short' });
      const yearShort = month.getFullYear().toString().substr(2, 2);

      result.push({
        name: `${monthName} ${yearShort}`,
        month: month.getMonth(),
        year: month.getFullYear(),
        rdvCount: 0,
        revenue: 0
      });
    }

    return result;
  }


  generateChartData(appointments: RendezVous[]): void {
    // Créer des Maps pour stocker les données par mois
    const rdvCountByMonth = new Map<string, number>();
    const revenueByMonth = new Map<string, number>();

    // Obtenir les 6 derniers mois dans l'ordre chronologique
    const lastSixMonths = this.getLastSixMonths();

    // Initialiser les maps avec des valeurs à zéro pour tous les mois
    lastSixMonths.forEach(monthKey => {
      rdvCountByMonth.set(monthKey.label, 0);
      revenueByMonth.set(monthKey.label, 0);
    });

    // Parcourir les rendez-vous et additionner les valeurs
    appointments.forEach(rdv => {
      if (!rdv.date) return;

      const rdvDate = new Date(rdv.date);
      const monthYear = this.formatMonthYear(rdvDate);

      if (rdvCountByMonth.has(monthYear)) {
        rdvCountByMonth.set(monthYear, rdvCountByMonth.get(monthYear)! + 1);

        // Ajouter le prix au revenu si disponible
        if (rdv.prix && typeof rdv.prix === 'number' && !isNaN(rdv.prix)) {
          revenueByMonth.set(monthYear, revenueByMonth.get(monthYear)! + rdv.prix);
        }
      }
    });

    // Trouver les valeurs max pour normaliser les hauteurs
    const maxRdvCount = Math.max(1, ...Array.from(rdvCountByMonth.values()));
    const maxRevenue = Math.max(1, ...Array.from(revenueByMonth.values()));

    // Convertir les Maps en tableaux pour l'affichage
    this.rdvsByMonth = lastSixMonths.map(month => {
      const value = rdvCountByMonth.get(month.label) || 0;
      return {
        name: month.label,
        value: value,
        height: value === 0 ? 0 : Math.max(5, Math.round((value / maxRdvCount) * 90))
      };
    });

    this.revenueByMonth = lastSixMonths.map(month => {
      const value = revenueByMonth.get(month.label) || 0;
      return {
        name: month.label,
        value: value,
        height: value === 0 ? 0 : Math.max(5, Math.round((value / maxRevenue) * 90))
      };
    });

    console.log('Rendez-vous par mois:', this.rdvsByMonth);
    console.log('Revenus par mois:', this.revenueByMonth);
  }

  /**
   * Retourne les 6 derniers mois dans l'ordre chronologique (du plus ancien au plus récent)
   */
  private getLastSixMonths(): { date: Date; label: string }[] {
    const result = [];
    const today = new Date();

    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      result.push({
        date: monthDate,
        label: this.formatMonthYear(monthDate)
      });
    }

    return result;
  }

  /**
   * Formatte un objet Date en chaîne "mois année" (ex: "jan 23")
   */
  private formatMonthYear(date: Date): string {
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().substr(2, 2);
    return `${month} ${year}`;
  }

// Calcule la hauteur d'une barre avec une hauteur minimale
  private calculateBarHeight(value: number, maxValue: number): number {
    // Assurer une hauteur minimale de 10% et maximale de 90%
    if (value === 0) return 0;
    if (maxValue === 0) return 10;

    return Math.max(10, Math.min(90, (value / maxValue * 80) + 10));
  }

  // Helper pour obtenir la classe CSS de la balise de statut RDV
  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
      case 'TERMINE':
      case 'DONE':
        return 'success';
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'warning';
      case 'CANCELLED':
      case 'ANNULE':
        return 'error';
      default:
        return 'default';
    }
  }

  // Helper pour obtenir le label du statut RDV
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'CANCELLED': return 'Annulé';
      case 'ANNULE': return 'Annulé';
      case 'DONE': return 'Terminé';
      case 'TERMINE': return 'Terminé';
      default: return status;
    }
  }

  // Filtrer les rendez-vous par médecin
  filterByMedecin(): void {
    if (!this.selectedMedecinId) {
      this.loadDashboardData(); // Recharger toutes les données
      return;
    }

    this.loadingAppointments = true;

    this.rdvService.getRdvs().subscribe({
      next: response => {
        const allAppointments = response.rdvs || [];

        // Filtrer par médecin sélectionné
        const filteredAppointments = allAppointments.filter((rdv: RendezVous) =>
          rdv.medecin && rdv.medecin.id === this.selectedMedecinId
        );

        // Mettre à jour les rendez-vous d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.todayAppointments = filteredAppointments.filter((rdv: RendezVous) => {
          const rdvDate = new Date(rdv.date);
          rdvDate.setHours(0, 0, 0, 0);
          return rdvDate.getTime() === today.getTime();
        });

        this.todayAppointmentsCount = this.todayAppointments.length;

        // Mettre à jour les rendez-vous en attente
        this.pendingAppointments = filteredAppointments.filter((rdv: RendezVous) =>
          rdv.statusRDV === 'PENDING'
        );
        this.pendingAppointmentsCount = this.pendingAppointments.length;

        this.loadingAppointments = false;
      },
      error: err => {
        this.message.error("Erreur lors du filtrage des rendez-vous");
        this.loadingAppointments = false;
      }
    });
  }

  // Confirmer un rendez-vous
  confirmAppointment(rdv: RendezVous): void {
    // Créer une copie du rendez-vous pour éviter la modification directe
    const updatedRdv: RendezVous = {
      ...rdv,
      statusRDV: 'CONFIRMED'
    };

    this.rdvService.updateRdv(rdv.id, updatedRdv).subscribe({
      next: () => {
        this.message.success('Rendez-vous confirmé avec succès');
        this.loadDashboardData(); // Recharger les données
      },
      error: (err) => {
        this.message.error('Erreur lors de la confirmation du rendez-vous');
      }
    });
  }

  // Exporter les rendez-vous du jour au format CSV
  exportTodayAppointments(): void {
    if (this.todayAppointments.length === 0) {
      this.message.warning('Aucun rendez-vous à exporter');
      return;
    }

    // Créer l'en-tête CSV
    let csvContent = 'Heure,Patient,Médecin,Statut\r\n';

    // Ajouter chaque rendez-vous
    this.todayAppointments.forEach((rdv: RendezVous) => {
      const time = new Date(rdv.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const patient = rdv.patient ? `${rdv.patient.titre || ''} ${rdv.patient.nom}` : 'N/A';
      const medecin = rdv.medecin ? `Dr. ${rdv.medecin.nom}` : 'N/A';
      const status = this.getStatusLabel(rdv.statusRDV);

      csvContent += `${time},${patient},${medecin},${status}\r\n`;
    });

    // Créer un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // Obtenir la date formatée pour le nom du fichier
    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    link.setAttribute('download', `rdv-${date}.csv`);

    // Simuler le clic pour télécharger
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.message.success('Export des rendez-vous réussi');
  }

  // Changer de rôle (pour démonstration)
  toggleRole(): void {
    this.userRole = this.userRole === 'MEDECIN' ? 'SECRETAIRE' : 'MEDECIN';
  }

  navigateToDetails(patientId: number): void {
    this.router.navigate(['/doc/patients/detail', patientId]);
  }
}
