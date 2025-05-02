import {Titre} from '../enums/titre.enum';
import {DossierMedical} from './dossierMedical.model';
import {RendezVous} from './rdv.model';

export interface Patient {
  id: number;
  nom: string;
  cin: string;
  email: string;
  dateNaissance: string;
  malade: boolean;
  adresse: string;
  codePostal: string ;
  numeroTelephone: string;
  rapport:string;
  titre: Titre;
  dossierMedical:DossierMedical;
  rendezVousList: RendezVous[];
}

