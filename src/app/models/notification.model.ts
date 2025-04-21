import { Patient } from './patient.model';

export interface Notification {
  id: number;
  message: string;
  lu: boolean;
  dateEnvoi: string;
  patient: Patient;
}
