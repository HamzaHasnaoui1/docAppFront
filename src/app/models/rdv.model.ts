import { Medecin } from './medecin.model';
import { Patient } from './patient.model';
import { Consultation } from './consultation.model';

export interface RendezVous {
  id: number;
  date: string;
  statusRDV: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE';
  patient?: Patient;
  medecin: Medecin;
  consultation?: Consultation;
}

export const RDV_STATUS_CONFIG = {
  PENDING: { color: 'orange', label: 'En attente' },
  CONFIRMED: { color: 'green', label: 'Confirmé' },
  CANCELLED: { color: 'red', label: 'Annulé' },
  DONE: { color: 'blue', label: 'Terminé' }
} as const;

export type RdvStatus = keyof typeof RDV_STATUS_CONFIG;
