import { Consultation } from './consultation.model';
import { Patient } from './patient.model';

export interface DossierMedical {
  id: number;
  patient: Patient;
  consultations: Consultation[];
  allergies: string;
  antecedents: string;
  traitementsChroniques: string;
}
