import {RendezVous} from './rdv.model';
import {Patient} from './patient.model';

export interface PatientWithRdvs extends Patient {
  rdvs: RendezVous[];
}
