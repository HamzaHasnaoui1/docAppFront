import { Medecin } from './medecin.model';

export interface DisponibiliteMedecin {
  id: number;
  medecin: Medecin;
  jourSemaine: string; // e.g. 'MONDAY'
  heureDebut: string;  // e.g. '08:00'
  heureFin: string;    // e.g. '12:00'
  disponible: boolean;
}
