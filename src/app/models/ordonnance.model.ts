import {RendezVous} from './rdv.model';

export interface Ordonnance {
  id: number;
  contenu: string;
  dateEmission: Date;
  archivee: boolean;
  rendezVous: RendezVous;
  medicamentsPrescrits: string[];
  posologies: { [key: string]: string };
  remarques: string;
}
