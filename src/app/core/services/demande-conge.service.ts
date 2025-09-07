import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DemandeConge, CreateDemandeCongeRequest, StatutConge } from '../models/demande-conge.model';

@Injectable({
  providedIn: 'root'
})
export class DemandeCongeService {
  private apiUrl = `${environment.apiUrl}/demandeConges`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les demandes de congés
   */
  getAll(): Observable<DemandeConge[]> {
    console.log('🔍 DemandeCongeService.getAll() - URL:', `${this.apiUrl}/get/list`);
    return this.http.get<DemandeConge[]>(`${this.apiUrl}/get/list`).pipe(
      tap(data => console.log('✅ DemandeCongeService.getAll() - Données reçues:', data)),
      catchError(error => {
        console.error('❌ DemandeCongeService.getAll() - Erreur:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère une demande de congé par son ID
   */
  getById(id: number): Observable<DemandeConge> {
    return this.http.get<DemandeConge>(`${this.apiUrl}/get/${id}`);
  }

  /**
   * Crée une nouvelle demande de congé
   */
  create(demande: CreateDemandeCongeRequest): Observable<DemandeConge> {
    return this.http.post<DemandeConge>(`${this.apiUrl}/add`, demande);
  }

  /**
   * Met à jour une demande de congé existante
   */
  update(id: number, demande: DemandeConge): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(`${this.apiUrl}/edit/${id}`, demande);
  }

  /**
   * Supprime une demande de congé
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * Valide une demande de congé (Manager ou RH)
   */
  validerDemande(id: number, commentaire?: string): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(`${this.apiUrl}/valider/${id}`, { commentaire });
  }

  /**
   * Rejette une demande de congé (Manager ou RH)
   */
  rejeterDemande(id: number, motif: string): Observable<DemandeConge> {
    return this.http.put<DemandeConge>(`${this.apiUrl}/rejeter/${id}`, { motif });
  }

  /**
   * Récupère les demandes par statut
   */
  getByStatut(statut: StatutConge): Observable<DemandeConge[]> {
    console.log('🔍 DemandeCongeService.getByStatut() - URL:', `${this.apiUrl}/statut/${statut}`, 'statut:', statut);
    return this.http.get<DemandeConge[]>(`${this.apiUrl}/statut/${statut}`).pipe(
      tap(data => console.log('✅ DemandeCongeService.getByStatut() - Données reçues:', data)),
      catchError(error => {
        console.error('❌ DemandeCongeService.getByStatut() - Erreur:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère les demandes d'un utilisateur spécifique
   */
  getByUser(userId: number): Observable<DemandeConge[]> {
    console.log('🔍 DemandeCongeService.getByUser() - URL:', `${this.apiUrl}/user/${userId}`, 'userId:', userId);
    return this.http.get<DemandeConge[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(data => console.log('✅ DemandeCongeService.getByUser() - Données reçues:', data)),
      catchError(error => {
        console.error('❌ DemandeCongeService.getByUser() - Erreur:', error);
        throw error;
      })
    );
  }
}