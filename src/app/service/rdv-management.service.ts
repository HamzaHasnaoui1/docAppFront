import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { RdvService } from './rdv.service';
import { DonneesPhysiologiquesService } from './donnees-physiologiques.service';
import { OrdonnanceService } from './ordonnance.service';
import { OrdonnanceMedicamentService } from './ordonnance-medicament.service';

@Injectable({ providedIn: 'root' })
export class RdvManagementService {
  constructor(
    private rdvService: RdvService,
    private donneesPhysioService: DonneesPhysiologiquesService,
    private ordonnanceService: OrdonnanceService,
    private ordonnanceMedicamentService: OrdonnanceMedicamentService
  ) {}

  saveRdvData(rdvId: number, rdvData: any): Observable<any> {
    return this.rdvService.updateRdv(rdvId, rdvData).pipe(
      catchError(err => {
        console.error('Erreur mise à jour RDV:', err);
        throw err;
      })
    );
  }

  saveMedicalData(rdvId: number, medicalData: any): Observable<any> {
    if (medicalData.id) {
      const { rendezVousId, ...updateData } = medicalData;
      return this.donneesPhysioService.updateDonneesPhysiologiques(medicalData.id, updateData);
    } else {
      return this.donneesPhysioService.saveDonneesPhysiologiques(medicalData, rdvId);
    }
  }

  saveOrdonnance(rdvId: number, ordonnanceData: any, medicamentsData: any[]): Observable<any> {
    const ordonnanceId = ordonnanceData.id;

    if (ordonnanceId) {
      return this.ordonnanceService.updateOrdonnance(ordonnanceId, ordonnanceData).pipe(
        switchMap(() => this.saveMedicaments(ordonnanceId, medicamentsData))
      );
    } else if (medicamentsData.length > 0) {
      const newOrdonnance = {
        ...ordonnanceData,
        rendezVous: { id: rdvId }
      };
      return this.ordonnanceService.createOrdonnance(newOrdonnance).pipe(
        switchMap(createdOrdonnance => {
          if (createdOrdonnance?.id) {
            return this.saveMedicaments(createdOrdonnance.id, medicamentsData);
          }
          return of(null);
        })
      );
    }
    return of(null);
  }

  private saveMedicaments(ordonnanceId: number, medicamentsData: any[]): Observable<any> {
    if (medicamentsData.length === 0) return of(null);

    const requests = medicamentsData.map(med => {
      const dto = {
        medicamentId: Number(med.medicamentId),
        dosage: med.posologie,
        duree: med.duree,
        frequence: med.frequence
      };

      if (med.id) {
        return this.ordonnanceMedicamentService.updateMedicament(med.id, dto);
      } else {
        return this.ordonnanceMedicamentService.ajouterMedicament(ordonnanceId, dto);
      }
    });

    return forkJoin(requests);
  }
}
