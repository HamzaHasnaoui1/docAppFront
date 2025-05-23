import {Patient} from './patient.model';
import {Document} from './document.model';

export interface DossierMedical {
  id: number;
  patient: Patient;
  allergies: string;
  antecedents: string;
  traitementsChroniques: string;
  groupeSanguin: string;
  documents?: Document[];
}
