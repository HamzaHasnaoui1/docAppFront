import {RendezVous} from './rdv.model';

export interface Consultation {
  id: number;
  dateConsultation: string | null;
  rapport: string;
  rendezVous: RendezVous;
  prix: string;
  statusRDV: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE';

}
