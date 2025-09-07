import { TypeConge } from './type-conge.model';

export enum StatutConge {
  EN_ATTENTE = 'EnAttente',
  ACCEPTE = 'Accepte', 
  REJETE = 'Rejete'
}

export interface DemandeConge {
  id?: number;
  dateDebut: Date;
  dateFin: Date;
  type: TypeConge;
  statut?: StatutConge;
  commentaire?: string;
  userId?: number;
}

export interface CreateDemandeCongeRequest {
  dateDebut: Date;
  dateFin: Date;
  typeId: number;
  commentaire?: string;
}