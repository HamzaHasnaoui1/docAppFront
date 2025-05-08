import {RendezVous} from './rdv.model';

export interface DonneesPhysiologiques {
  id: number;
  rendezVous: RendezVous;
  poids: number;
  taille: number;
  imc: number;
  oeilDroit: string;
  oeilGauche: string;
  tensionSystolique: number;
  tensionDiastolique: number;
  frequenceCardiaque: number;
  frequenceRespiratoire: number;
  temperature: number;
  glycemie: number;
  remarques: string;
}
