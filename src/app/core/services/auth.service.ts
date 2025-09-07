import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { username, password };
    return this.http.post<LoginResponse>(`${environment.authUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          // Stocker le token et les informations utilisateur
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  register(userData: RegisterRequest): Observable<string> {
    return this.http.post<string>(`${environment.authUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.roles && user.roles.includes(role));
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser() && !!this.getToken();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // Méthodes pour vérifier les rôles spécifiques
  isEmployee(): boolean {
    return this.hasRole('ROLE_EMPLOYEE');
  }

  isManager(): boolean {
    return this.hasRole('ROLE_MANAGER');
  }

  isRH(): boolean {
    return this.hasRole('ROLE_RH');
  }
}