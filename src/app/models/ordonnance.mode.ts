import { Consultation } from './consultation.model';

export interface Ordonnance {
  id: number;
  contenu: string;
  consultation: Consultation;
  dateEmission: string;
}
