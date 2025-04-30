import { Patient } from './patient.model';


export interface Paiement {
  id: number;
  montant: number;
  datePaiement: string;
  modePaiement: ModePaiement;
  patient: Patient;
}

export const MODE_PAIEMENT_CONFIG = {
  ESPECES: { label: 'Espèces', icon: '💵' },
  CARTE_BANCAIRE: { label: 'Carte Bancaire', icon: '💳' },
  VIREMENT: { label: 'Virement', icon: '🏦' },
  CHEQUE: { label: 'Chèque', icon: '🧾' }
} as const;

export type ModePaiement = keyof typeof MODE_PAIEMENT_CONFIG;
