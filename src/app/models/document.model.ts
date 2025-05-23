export interface Document {
  id?: number;
  nom: string;
  type: string;
  description?: string;
  dateAjout?: Date | string;
  chemin?: string;
  categorie?: string;
  taille?: number;
  contenu?: ArrayBuffer | string; // For uploaded content
  urlAcces?: string; // URL for accessing the document
} 