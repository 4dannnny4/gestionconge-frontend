import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DemandeCongeService } from '../../core/services/demande-conge.service';
import { DemandeConge } from '../../core/models/demande-conge.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  pendingCount = 0;
  currentPageTitle = 'Dashboard';

  constructor(
    public authService: AuthService,
    private demandeCongeService: DemandeCongeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPendingCount();
    this.setupPageTitleListener();
  }

  getFirstRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.roles?.[0]?.replace('ROLE_', '') || '';
  }

  getPendingCount(): number {
    return this.pendingCount;
  }

  private loadPendingCount() {
    if (this.authService.hasRole('ROLE_MANAGER') || this.authService.hasRole('ROLE_RH')) {
      this.demandeCongeService.getDemandesByStatut('EnAttente').subscribe({
        next: (demandes: DemandeConge[]) => {
          this.pendingCount = demandes.length;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des demandes en attente:', error);
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
    return this.currentPageTitle;
  }

  private setupPageTitleListener() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
  }

  private updatePageTitle(url: string) {
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/demandes': 'Mes Demandes',
      '/demandes/create': 'Nouvelle Demande',
      '/validation': 'Validation',
      '/rh/dashboard': 'RH Dashboard',
      '/reports': 'Rapports',
      '/profile': 'Mon Profil',
      '/settings': 'Paramètres'
    };

    this.currentPageTitle = routeMap[url] || 'Dashboard';
  }
}