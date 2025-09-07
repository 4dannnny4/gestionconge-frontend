import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Gestion Congés';
  showNavbar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Écouter les changements de route pour afficher/masquer la navbar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = this.shouldShowNavbar(event.url);
      });

    // Vérifier l'état initial
    this.showNavbar = this.shouldShowNavbar(this.router.url);
  }

  /**
   * Détermine si la navbar doit être affichée
   */
  private shouldShowNavbar(url: string): boolean {
    // Ne pas afficher la navbar sur les pages d'authentification
    return !url.includes('/auth/') && this.authService.isAuthenticated();
  }
}