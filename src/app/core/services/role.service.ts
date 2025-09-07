import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les rôles disponibles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/get/list`);
  }

  /**
   * Récupère un rôle par son ID
   */
  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/get/${id}`);
  }

  /**
   * Récupère un rôle par son nom
   */
  getByName(name: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/get/name/${name}`);
  }

  /**
   * Récupère les rôles disponibles pour l'inscription
   */
  getAvailableRolesForRegistration(): Role[] {
    return [
      { id: 1, nom: 'ROLE_EMPLOYEE' },
      { id: 2, nom: 'ROLE_MANAGER' },
      { id: 3, nom: 'ROLE_RH' }
      // Note: ROLE_ADMIN n'est pas disponible pour l'inscription publique
    ];
  }

  /**
   * Convertit un nom de rôle en nom d'affichage
   */
  getRoleDisplayName(roleName: string): string {
    const roleMap: { [key: string]: string } = {
      'ROLE_EMPLOYEE': 'Employé',
      'ROLE_MANAGER': 'Manager',
      'ROLE_RH': 'Ressources Humaines',
      'ROLE_ADMIN': 'Administrateur'
    };
    return roleMap[roleName] || roleName;
  }

  /**
   * Convertit un nom de rôle en description
   */
  getRoleDescription(roleName: string): string {
    const descriptions: { [key: string]: string } = {
      'ROLE_EMPLOYEE': 'Peut créer et consulter ses demandes de congés',
      'ROLE_MANAGER': 'Peut valider les demandes de son équipe',
      'ROLE_RH': 'Peut gérer tous les congés et soldes',
      'ROLE_ADMIN': 'Accès complet au système'
    };
    return descriptions[roleName] || 'Rôle utilisateur';
  }

  /**
   * Convertit un nom de rôle en icône
   */
  getRoleIcon(roleName: string): string {
    const icons: { [key: string]: string } = {
      'ROLE_EMPLOYEE': 'person',
      'ROLE_MANAGER': 'supervisor_account',
      'ROLE_RH': 'business',
      'ROLE_ADMIN': 'admin_panel_settings'
    };
    return icons[roleName] || 'person';
  }
}
