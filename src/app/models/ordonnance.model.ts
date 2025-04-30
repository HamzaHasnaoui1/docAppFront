import {RendezVous} from './rdv.model';

export interface Ordonnance {
  id?: number;
  contenu?: string;
  dateEmission?: string; // format ISO string (ex: "2025-04-30")
  archivee?: boolean;
  rendezVous?: RendezVous;
  medicamentsPrescrits?: string[];
  posologies?: { [medicamentNom: string]: string };
  remarques?: string;
}
