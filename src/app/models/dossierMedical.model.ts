import {Patient} from './patient.model';

export interface DossierMedical {
  id: number;
  patient: Patient;
  allergies: string;
  antecedents: string;
  traitementsChroniques: string;
  groupeSanguin: string;
}
