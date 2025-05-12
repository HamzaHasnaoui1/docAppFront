// src/app/components/patient/patient-stats/patient-stats.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';
import { Patient } from '../../../models/patient.model';
import { RendezVous } from '../../../models/rdv.model';
import { DonneesPhysiologiques } from '../../../models/DonneesPhysiologiques.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-patient-stats',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzProgressModule,
    NzDividerModule,
    NzTabsModule,
    NzTagModule,
    NzEmptyModule,
    NzSpinModule,
    NzAlertModule,
    NzIconModule,
    NzResultModule
  ],
  templateUrl: './patient-stats.component.html',
  styleUrl: './patient-stats.component.scss'
})
export class PatientStatsComponent implements OnInit, OnChanges {
  @Input() patient: Patient | null = null;

  healthReport: any = null;
  donneesPhysiologiques: DonneesPhysiologiques[] = [];
  loading = true;
  error = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient'] && !changes['patient'].firstChange) {
      this.loadData();
    }
  }

  private loadData(): void {
    if (this.patient?.id) {
      this.fetchMedicalData();
      this.fetchHealthReport();
    } else {
      this.loading = false;
    }
  }

  fetchMedicalData(): void {
    if (!this.patient?.id) {
      this.loading = false;
      return;
    }

    this.http.get<DonneesPhysiologiques[]>(`${environment.apiUrl}/user/patients/${this.patient.id}/donnees-physiologiques/latest`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des données physiologiques', error);
          this.error = true;
          this.loading = false;
          return of([]);
        })
      )
      .subscribe(data => {
        this.donneesPhysiologiques = data;
        this.loading = false;
      });
  }

  fetchHealthReport(): void {
    if (!this.patient?.id) return;

    this.http.get<any>(`${environment.apiUrl}/stats/medical/patients/${this.patient.id}/rapport-sante`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement du rapport de santé', error);
          return of(null);
        })
      )
      .subscribe(report => {
        this.healthReport = report;
      });
  }

  // Le reste du code reste inchangé...

  calculateIMC(): number | null {
    const latestData = this.donneesPhysiologiques[0];
    if (!latestData) return null;

    if (latestData.imc) return latestData.imc;

    if (latestData.poids && latestData.taille && latestData.taille > 0) {
      const heightInMeters = latestData.taille / 100;
      return +(latestData.poids / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return null;
  }

  getIMCStatus(imc: number | null): { text: string, color: string } {
    if (imc === null) return { text: 'Non disponible', color: 'default' };

    if (imc < 18.5) return { text: 'Insuffisance pondérale', color: 'blue' };
    if (imc < 25) return { text: 'Poids normal', color: 'success' };
    if (imc < 30) return { text: 'Surpoids', color: 'warning' };
    if (imc < 35) return { text: 'Obésité modérée', color: 'warning' };
    if (imc < 40) return { text: 'Obésité sévère', color: 'error' };
    return { text: 'Obésité morbide', color: 'error' };
  }

  getBloodPressureStatus(): { text: string, color: string } {
    const latestData = this.donneesPhysiologiques[0];
    if (!latestData || !latestData.tensionSystolique || !latestData.tensionDiastolique) {
      return { text: 'Non disponible', color: 'default' };
    }

    const systolic = latestData.tensionSystolique;
    const diastolic = latestData.tensionDiastolique;

    if (systolic < 120 && diastolic < 80) return { text: 'Optimale', color: 'success' };
    if (systolic < 130 && diastolic < 85) return { text: 'Normale', color: 'success' };
    if (systolic < 140 && diastolic < 90) return { text: 'Normale haute', color: 'processing' };
    if (systolic < 160 && diastolic < 100) return { text: 'HTA légère', color: 'warning' };
    if (systolic < 180 && diastolic < 110) return { text: 'HTA modérée', color: 'error' };
    return { text: 'HTA sévère', color: 'error' };
  }

  getVisionStatus(): { left: string, right: string } {
    const latestData = this.donneesPhysiologiques[0];
    if (!latestData) return { left: 'N/A', right: 'N/A' };

    return {
      left: latestData.oeilGauche || 'N/A',
      right: latestData.oeilDroit || 'N/A'
    };
  }

  getPatientAge(): number {
    if (!this.patient?.dateNaissance) return 0;

    const birthDate = new Date(this.patient.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getIMCTrend(): { direction: string, value: number | null, icon: string, color: string } {
    if (this.donneesPhysiologiques.length < 2) {
      return { direction: '', value: null, icon: 'minus', color: 'gray' };
    }

    const latest = this.donneesPhysiologiques[0];
    const previous = this.donneesPhysiologiques[1];

    if (!latest.imc || !previous.imc) {
      return { direction: '', value: null, icon: 'minus', color: 'gray' };
    }

    const diff = +(latest.imc - previous.imc).toFixed(1);

    if (diff === 0) return { direction: 'stable', value: 0, icon: 'minus', color: 'gray' };
    if (diff > 0) return { direction: 'hausse', value: diff, icon: 'arrow-up', color: diff > 1 ? 'red' : 'orange' };
    return { direction: 'baisse', value: Math.abs(diff), icon: 'arrow-down', color: Math.abs(diff) > 1 ? 'green' : 'blue' };
  }

  getVitalSignsStatus(): { text: string, color: string } {
    const latestData = this.donneesPhysiologiques[0];
    if (!latestData) return { text: 'Non disponible', color: 'default' };

    // Logique simplifiée pour l'exemple
    const heartRate = latestData.frequenceCardiaque;
    const temperature = latestData.temperature;

    if (!heartRate && !temperature) return { text: 'Non disponible', color: 'default' };

    let abnormal = 0;
    let total = 0;

    if (heartRate) {
      total++;
      if (heartRate < 60 || heartRate > 100) abnormal++;
    }

    if (temperature) {
      total++;
      if (temperature < 36 || temperature > 37.8) abnormal++;
    }

    if (abnormal === 0) return { text: 'Normaux', color: 'success' };
    if (abnormal < total) return { text: 'Partiellement anormaux', color: 'warning' };
    return { text: 'Anormaux', color: 'error' };
  }
}
