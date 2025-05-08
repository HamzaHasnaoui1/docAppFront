import { RendezVous } from './rdv.model';
import {OrdonnanceMedicament} from './OrdonnanceMedicament.model';

export interface Ordonnance {
  id?: number;
  contenu?: string;
  dateEmission?: string;
  archivee?: boolean;
  rendezVous?: RendezVous;
  remarques?: string;
  medicaments?: OrdonnanceMedicament[];
}
