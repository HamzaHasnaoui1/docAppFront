import {Titre} from '../enums/titre.enum';

export interface Patient {
  id: number;
  nom: string;
  dateNaissance: string;
  malade: boolean;
  adresse: string;
  codePostal: string ;
  numeroTelephone: string;
  titre: Titre;
  rapport: string;
}

