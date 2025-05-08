export interface Medicament {
  id: number;
  nom: string;
  description?: string;
  categorie?: string;
  fabricant?: string;
  dosageStandard?: string;
  actif?: boolean;
}
