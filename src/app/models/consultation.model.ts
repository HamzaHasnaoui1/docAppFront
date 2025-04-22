import {RendezVous} from './rdv.model';
import {DossierMedical} from './dossierMedical.model';
import {Ordonnance} from './ordonnance.model';

export interface Consultation {
  id: number;
  dateConsultation: string ;
  rapport: string;
  rendezVous: RendezVous;
  prix: string;
  statusRDV: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE';
  ordonnance?: Ordonnance;
  dossierMedical?: DossierMedical;
}
