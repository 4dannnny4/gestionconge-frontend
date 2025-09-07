import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les utilisateurs
   */
  getAll(): Observable<User[]> {
    console.log('🔍 UserService.getAll() - URL:', `${this.apiUrl}/get/list`);
    return this.http.get<User[]>(`${this.apiUrl}/get/list`).pipe(
      tap(data => console.log('✅ UserService.getAll() - Données reçues:', data)),
      catchError(error => {
        console.error('❌ UserService.getAll() - Erreur:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get/${id}`);
  }

  /**
   * Crée un nouvel utilisateur
   */
  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/add`, user);
  }

  /**
   * Met à jour un utilisateur existant
   */
  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/edit/${id}`, user);
  }

  /**
   * Supprime un utilisateur
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * Récupère les utilisateurs par rôle
   */
  getByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  /**
   * Récupère les managers
   */
  getManagers(): Observable<User[]> {
    return this.getByRole('ROLE_MANAGER');
  }

  /**
   * Récupère les employés
   */
  getEmployees(): Observable<User[]> {
    return this.getByRole('ROLE_EMPLOYEE');
  }
}