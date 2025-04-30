import { Medecin } from './medecin.model';
import { Patient } from './patient.model';
import {Ordonnance} from './ordonnance.model';

export interface RendezVous {
  id: number;
  date: string;
  startTime: string;  // Previously heureDebut
  endTime: string;
  statusRDV: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE' | 'EN_ATTENTE' | 'TERMINE' | 'ANNULE';
  patient: Patient;
  medecin: Medecin;
  ordonnance?: Ordonnance;
  rapport: string;
  prix: number;}

export const RDV_STATUS_CONFIG = {
  PENDING: { color: 'orange', label: 'En attente' },
  CONFIRMED: { color: 'green', label: 'Confirmé' },
  CANCELLED: { color: 'red', label: 'Annulé' },
  DONE: { color: 'blue', label: 'Terminé' },
  EN_ATTENTE: { color: 'orange', label: 'En attente' }, // Same as PENDING
  TERMINE: { color: 'blue', label: 'Terminé' }, // Same as DONE
  ANNULE: { color: 'red', label: 'Annulé' } // Same as CANCELLED
} as const;

export type RdvStatus = keyof typeof RDV_STATUS_CONFIG;
