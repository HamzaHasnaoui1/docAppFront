export interface CreateRendezVous {
  date: string;
  dateFin: string;
  statusRDV: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DONE';
  patient: { id: number };
  medecin: { id: number };
  rapport: string;
  prix: number;
}
