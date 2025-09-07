import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SoldeConge } from '../models/solde-conge.model';

@Injectable({
  providedIn: 'root'
})
export class SoldeCongeService {
  private apiUrl = `${environment.apiUrl}/soldeConges`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère un solde de congé par son ID
   */
  getById(id: number): Observable<SoldeConge> {
    return this.http.get<SoldeConge>(`${this.apiUrl}/get/${id}`);
  }

  /**
   * Récupère tous les soldes de congés
   */
  getAll(): Observable<SoldeConge[]> {
    return this.http.get<SoldeConge[]>(`${this.apiUrl}/get/list`);
  }

  /**
   * Récupère le solde d'un utilisateur spécifique
   */
  getByUser(userId: number): Observable<SoldeConge> {
    console.log('🔍 SoldeCongeService.getByUser() - URL:', `${this.apiUrl}/user/${userId}`, 'userId:', userId);
    return this.http.get<SoldeConge>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(data => console.log('✅ SoldeCongeService.getByUser() - Données reçues:', data)),
      catchError(error => {
        console.error('❌ SoldeCongeService.getByUser() - Erreur:', error);
        throw error;
      })
    );
  }

  /**
   * Crée un nouveau solde de congé
   */
  create(solde: SoldeConge): Observable<SoldeConge> {
    return this.http.post<SoldeConge>(`${this.apiUrl}/add`, solde);
  }

  /**
   * Met à jour un solde de congé existant
   */
  update(id: number, solde: SoldeConge): Observable<SoldeConge> {
    return this.http.put<SoldeConge>(`${this.apiUrl}/edit/${id}`, solde);
  }

  /**
   * Supprime un solde de congé
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * Met à jour le solde après validation d'une demande
   */
  updateSoldeAfterValidation(userId: number, joursUtilises: number): Observable<SoldeConge> {
    return this.http.put<SoldeConge>(`${this.apiUrl}/update-after-validation`, {
      userId,
      joursUtilises
    });
  }

  /**
   * Calcule le nombre de jours ouvrés entre deux dates
   */
  calculerJoursOuvres(dateDebut: Date, dateFin: Date): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    let joursOuvres = 0;
    
    while (debut <= fin) {
      const jourSemaine = debut.getDay();
      // Exclure les weekends (0 = dimanche, 6 = samedi)
      if (jourSemaine !== 0 && jourSemaine !== 6) {
        joursOuvres++;
      }
      debut.setDate(debut.getDate() + 1);
    }
    
    return joursOuvres;
  }
}
