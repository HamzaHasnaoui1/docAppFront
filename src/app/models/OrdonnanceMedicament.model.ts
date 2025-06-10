import {Medicament} from './Medicament.model';

export interface OrdonnanceMedicament {
  id?: number;
  ordonnanceId?: number;
  posologie: string;
  duree?: string;
  frequence?: string;
  instructions?: string;
  medicament: Medicament;
}
