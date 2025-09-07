import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DemandeCongeService } from '../../core/services/demande-conge.service';
import { DemandeConge, StatutConge } from '../../core/models/demande-conge.model';
import { Router } from '@angular/router';
import { SoldeCongeService } from '../../core/services/solde-conge.service';
import { SoldeConge } from '../../core/models/solde-conge.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Statistiques
  stats = {
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesAcceptees: 0,
    demandesRejetees: 0
  };
  
  recentDemandes: DemandeConge[] = [];
  currentUser: any;
  userSolde: SoldeConge | null = null;
  loading = true;
  error = '';
  
  // Colonnes pour le tableau Material
  displayedColumns: string[] = ['type', 'dateDebut', 'dateFin', 'statut', 'commentaire'];

  constructor(
    private authService: AuthService,
    private demandeService: DemandeCongeService,
    private router: Router,
    private soldeCongeService: SoldeCongeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('🔍 DashboardComponent.ngOnInit() - Utilisateur connecté:', this.currentUser);
    this.loadDashboardData();
  }

  /**
   * Charge les données du tableau de bord
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Charger les données selon le rôle de l'utilisateur
    if (this.authService.isEmployee()) {
      this.loadEmployeeDashboard();
    } else {
      this.loadManagerDashboard();
    }
  }

  /**
   * Charge le tableau de bord pour un employé
   */
  private loadEmployeeDashboard(): void {
    console.log('🔍 DashboardComponent.loadEmployeeDashboard() - userId:', this.currentUser?.userId);
    if (this.currentUser?.userId) {
      // Charger les demandes de l'utilisateur
      this.demandeService.getByUser(this.currentUser.userId).subscribe({
        next: (demandes) => {
          console.log('✅ DashboardComponent.loadEmployeeDashboard() - Demandes reçues:', demandes);
          this.calculateStats(demandes);
          this.recentDemandes = demandes.slice(0, 5);
          this.loadUserSolde();
        },
        error: (error) => {
          console.error('❌ DashboardComponent.loadEmployeeDashboard() - Erreur:', error);
          this.error = 'Erreur lors du chargement de vos demandes';
          this.loading = false;
        }
      });
    } else {
      console.warn('⚠️ DashboardComponent.loadEmployeeDashboard() - Pas de userId trouvé');
      this.loading = false;
    }
  }

  /**
   * Charge le tableau de bord pour un manager/RH
   */
  private loadManagerDashboard(): void {
    console.log('🔍 DashboardComponent.loadManagerDashboard() - Chargement de toutes les demandes');
    // Charger toutes les demandes
    this.demandeService.getAll().subscribe({
      next: (demandes) => {
        console.log('✅ DashboardComponent.loadManagerDashboard() - Demandes reçues:', demandes);
        this.calculateStats(demandes);
        this.recentDemandes = demandes.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ DashboardComponent.loadManagerDashboard() - Erreur:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  /**
   * Charge le solde de l'utilisateur connecté
   */
  private loadUserSolde(): void {
    if (this.currentUser?.userId) {
      this.soldeCongeService.getByUser(this.currentUser.userId).subscribe({
        next: (solde) => {
          this.userSolde = solde;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du solde:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  /**
   * Calcule les statistiques des demandes
   */
  private calculateStats(demandes: DemandeConge[]): void {
    this.stats = {
      totalDemandes: demandes.length,
      demandesEnAttente: demandes.filter(d => d.statut === StatutConge.EN_ATTENTE).length,
      demandesAcceptees: demandes.filter(d => d.statut === StatutConge.ACCEPTE).length,
      demandesRejetees: demandes.filter(d => d.statut === StatutConge.REJETE).length
    };
  }

  /**
   * Obtient la classe CSS pour le statut
   */
  getStatusClass(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'badge bg-warning';
      case 'Accepte': return 'badge bg-success';
      case 'Rejete': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  /**
   * Obtient le texte du statut
   */
  getStatusText(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'En attente';
      case 'Accepte': return 'Acceptée';
      case 'Rejete': return 'Rejetée';
      default: return statut;
    }
  }

  /**
   * Navigation vers les demandes
   */
  goToDemandes(): void {
    this.router.navigate(['/demandes']);
  }

  /**
   * Navigation vers la création de demande
   */
  createDemande(): void {
    this.router.navigate(['/demandes/create']);
  }

  /**
   * Navigation vers la validation
   */
  goToValidation(): void {
    this.router.navigate(['/validation']);
  }

  /**
   * Navigation vers le tableau de bord RH
   */
  goToRHDashboard(): void {
    this.router.navigate(['/rh/dashboard']);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Vérifie si l'utilisateur est un employé
   */
  isEmployee(): boolean {
    return this.authService.isEmployee();
  }

  /**
   * Vérifie si l'utilisateur est un manager
   */
  isManager(): boolean {
    return this.authService.isManager();
  }

  /**
   * Vérifie si l'utilisateur est RH
   */
  isRH(): boolean {
    return this.authService.isRH();
  }

  /**
   * Obtient la classe CSS pour le chip de rôle
   */
  getRoleChipClass(): string {
    if (this.authService.hasRole('ROLE_ADMIN')) return 'role-admin';
    if (this.authService.hasRole('ROLE_RH')) return 'role-rh';
    if (this.authService.hasRole('ROLE_MANAGER')) return 'role-manager';
    if (this.authService.hasRole('ROLE_EMPLOYEE')) return 'role-employee';
    return 'role-default';
  }

  /**
   * Obtient l'icône pour le rôle
   */
  getRoleIcon(): string {
    if (this.authService.hasRole('ROLE_ADMIN')) return 'admin_panel_settings';
    if (this.authService.hasRole('ROLE_RH')) return 'business';
    if (this.authService.hasRole('ROLE_MANAGER')) return 'supervisor_account';
    if (this.authService.hasRole('ROLE_EMPLOYEE')) return 'person';
    return 'help';
  }

  /**
   * Obtient le nom d'affichage du rôle
   */
  getRoleDisplayName(): string {
    if (this.authService.hasRole('ROLE_ADMIN')) return 'Administrateur';
    if (this.authService.hasRole('ROLE_RH')) return 'Ressources Humaines';
    if (this.authService.hasRole('ROLE_MANAGER')) return 'Manager';
    if (this.authService.hasRole('ROLE_EMPLOYEE')) return 'Employé';
    return 'Utilisateur';
  }

  /**
   * Obtient la classe CSS pour le chip de statut
   */
  getStatusChipClass(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'status-pending';
      case 'Accepte': return 'status-approved';
      case 'Rejete': return 'status-rejected';
      default: return 'status-default';
    }
  }

  /**
   * Obtient l'icône pour le statut
   */
  getStatusIcon(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'schedule';
      case 'Accepte': return 'check_circle';
      case 'Rejete': return 'cancel';
      default: return 'help';
    }
  }

  /**
   * Teste la connexion à l'API
   */
  testApiConnection(): void {
    console.log('🧪 Test de connexion API démarré...');
    
    // Test 1: Vérifier l'utilisateur connecté
    console.log('🧪 Test 1 - Utilisateur connecté:', this.currentUser);
    console.log('🧪 Test 1 - Token présent:', !!this.authService.getToken());
    
    // Test 2: Tester l'API des utilisateurs
    console.log('🧪 Test 2 - Test API utilisateurs...');
    this.demandeService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Test 2 - API demandes fonctionne:', data);
      },
      error: (error) => {
        console.error('❌ Test 2 - Erreur API demandes:', error);
      }
    });
    
    // Test 3: Tester l'API des demandes
    console.log('🧪 Test 3 - Test API demandes...');
    this.demandeService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Test 3 - API demandes fonctionne:', data);
      },
      error: (error) => {
        console.error('❌ Test 3 - Erreur API demandes:', error);
      }
    });
  }
}