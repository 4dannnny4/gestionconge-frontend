import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: LoginResponse | null = null;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUser;
  }

  getUsername(): string {
    return this.currentUser?.username || 'Utilisateur';
  }

  getFirstRole(): string {
    return this.currentUser?.roles?.[0]?.replace('ROLE_', '') || '';
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  isEmployee(): boolean {
    return this.authService.isEmployee();
  }

  isManager(): boolean {
    return this.authService.isManager();
  }

  isRH(): boolean {
    return this.authService.isRH();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}