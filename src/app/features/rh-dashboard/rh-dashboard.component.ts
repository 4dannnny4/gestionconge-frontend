import { Component, OnInit } from '@angular/core';
import { DemandeCongeService } from '../../core/services/demande-conge.service';
import { SoldeCongeService } from '../../core/services/solde-conge.service';
import { UserService } from '../../core/services/user.service';
import { ReportingService } from '../../core/services/reporting.service';
import { DemandeConge, StatutConge } from '../../core/models/demande-conge.model';
import { SoldeConge } from '../../core/models/solde-conge.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-rh-dashboard',
  templateUrl: './rh-dashboard.component.html',
  styleUrls: ['./rh-dashboard.component.css']
})
export class RhDashboardComponent implements OnInit {
  // Données
  demandes: DemandeConge[] = [];
  soldes: SoldeConge[] = [];
  users: User[] = [];
  
  // Statistiques
  stats = {
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesAcceptees: 0,
    demandesRejetees: 0,
    totalEmployes: 0,
    totalJoursUtilises: 0,
    totalJoursRestants: 0
  };

  // Données de reporting
  reportingData = {
    demandesRepartition: {} as {[key: string]: number},
    demandesParMois: {} as {[key: string]: number},
    top5JoursRestants: [] as any[],
    top5Demandes: [] as any[]
  };

  // Graphiques
  chartData = {
    demandesParStatut: {
      labels: ['En attente', 'Acceptées', 'Rejetées'],
      data: [0, 0, 0],
      colors: ['#ffc107', '#28a745', '#dc3545']
    },
    demandesParMois: {
      labels: [] as string[],
      data: [] as number[]
    }
  };

  loading = true;
  error = '';

  constructor(
    private demandeCongeService: DemandeCongeService,
    private soldeCongeService: SoldeCongeService,
    private userService: UserService,
    private reportingService: ReportingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Charge toutes les données du tableau de bord
   */
  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Charger les données en parallèle
    Promise.all([
      this.loadDemandes(),
      this.loadSoldes(),
      this.loadUsers(),
      this.loadReportingData()
    ]).then(() => {
      this.calculateStats();
      this.prepareChartData();
      this.loading = false;
    }).catch(error => {
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
    });
  }

  /**
   * Charge toutes les demandes de congés
   */
  private loadDemandes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.demandeCongeService.getAll().subscribe({
        next: (demandes) => {
          this.demandes = demandes;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des demandes:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Charge tous les soldes de congés
   */
  private loadSoldes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.soldeCongeService.getAll().subscribe({
        next: (soldes) => {
          this.soldes = soldes;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des soldes:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Charge tous les utilisateurs
   */
  private loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getAll().subscribe({
        next: (users) => {
          this.users = users;
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Charge les données de reporting
   */
  private loadReportingData(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.reportingService.getDemandesRepartition().toPromise(),
        this.reportingService.getDemandesParMois().toPromise(),
        this.reportingService.getTop5JoursRestants().toPromise(),
        this.reportingService.getTop5Demandes().toPromise()
      ]).then(([repartition, parMois, top5Jours, top5Demandes]) => {
        this.reportingData.demandesRepartition = repartition || {};
        this.reportingData.demandesParMois = parMois || {};
        this.reportingData.top5JoursRestants = top5Jours || [];
        this.reportingData.top5Demandes = top5Demandes || [];
        console.log('Données de reporting chargées:', this.reportingData);
        resolve();
      }).catch(error => {
        console.error('Erreur lors du chargement des données de reporting:', error);
        // Ne pas rejeter pour éviter de bloquer le chargement
        resolve();
      });
    });
  }


  /**
   * Calcule les statistiques globales
   */
  calculateStats(): void {
    this.stats = {
      totalDemandes: this.demandes.length,
      demandesEnAttente: this.demandes.filter(d => d.statut === StatutConge.EN_ATTENTE).length,
      demandesAcceptees: this.demandes.filter(d => d.statut === StatutConge.ACCEPTE).length,
      demandesRejetees: this.demandes.filter(d => d.statut === StatutConge.REJETE).length,
      totalEmployes: this.users.filter(u => u.roles?.some(r => r.nom === 'ROLE_EMPLOYEE')).length,
      totalJoursUtilises: this.soldes.reduce((sum, solde) => sum + solde.utilise, 0),
      totalJoursRestants: this.soldes.reduce((sum, solde) => sum + solde.restant, 0)
    };
  }

  /**
   * Prépare les données pour les graphiques
   */
  prepareChartData(): void {
    // Données pour le graphique des statuts depuis l'API
    if (this.reportingData.demandesRepartition) {
      this.chartData.demandesParStatut.data = [
        this.reportingData.demandesRepartition['EnAttente'] || 0,
        this.reportingData.demandesRepartition['Accepte'] || 0,
        this.reportingData.demandesRepartition['Rejete'] || 0
      ];
    } else {
      // Fallback sur les données locales
      this.chartData.demandesParStatut.data = [
        this.stats.demandesEnAttente,
        this.stats.demandesAcceptees,
        this.stats.demandesRejetees
      ];
    }

    // Données pour le graphique des demandes par mois depuis l'API
    if (this.reportingData.demandesParMois) {
      this.chartData.demandesParMois.labels = Object.keys(this.reportingData.demandesParMois);
      this.chartData.demandesParMois.data = Object.values(this.reportingData.demandesParMois);
    } else {
      // Fallback sur les données locales
      this.prepareMonthlyData();
    }
  }

  /**
   * Prépare les données mensuelles (fallback)
   */
  private prepareMonthlyData(): void {
    const monthlyData = new Map<string, number>();
    
    this.demandes.forEach(demande => {
      const month = new Date(demande.dateDebut).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    this.chartData.demandesParMois.labels = Array.from(monthlyData.keys()) as string[];
    this.chartData.demandesParMois.data = Array.from(monthlyData.values()) as number[];
  }

  /**
   * Obtient le pourcentage de demandes acceptées
   */
  getAcceptanceRate(): number {
    if (this.stats.totalDemandes === 0) return 0;
    return Math.round((this.stats.demandesAcceptees / this.stats.totalDemandes) * 100);
  }

  /**
   * Obtient le pourcentage de demandes rejetées
   */
  getRejectionRate(): number {
    if (this.stats.totalDemandes === 0) return 0;
    return Math.round((this.stats.demandesRejetees / this.stats.totalDemandes) * 100);
  }

  /**
   * Obtient le taux d'utilisation des congés
   */
  getUtilizationRate(): number {
    const totalJours = this.stats.totalJoursUtilises + this.stats.totalJoursRestants;
    if (totalJours === 0) return 0;
    return Math.round((this.stats.totalJoursUtilises / totalJours) * 100);
  }

  /**
   * Calcule la largeur de la barre pour le graphique mensuel
   */
  getBarWidth(value: number): number {
    if (!this.chartData.demandesParMois.data.length) return 0;
    const maxValue = Math.max(...this.chartData.demandesParMois.data);
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  }

  /**
   * Obtient les employés avec le plus de jours de congé restants
   */
  getTopEmployeesWithRemainingDays(): any[] {
    return this.reportingData.top5JoursRestants || [];
  }

  /**
   * Obtient les employés avec le plus de demandes
   */
  getTopEmployeesWithRequests(): any[] {
    return this.reportingData.top5Demandes || [];
  }

  /**
   * Actualise les données du tableau de bord
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  /**
   * Exporte les données en CSV
   */
  exportToCSV(): void {
    const headers = ['Utilisateur', 'Type de congé', 'Date début', 'Date fin', 'Statut', 'Commentaire'];
    const data = this.demandes.map(demande => ({
      'Utilisateur': this.getUserName(demande.userId!),
      'Type de congé': demande.type?.nom || '',
      'Date début': new Date(demande.dateDebut).toLocaleDateString('fr-FR'),
      'Date fin': new Date(demande.dateFin).toLocaleDateString('fr-FR'),
      'Statut': this.getStatusText(demande.statut!),
      'Commentaire': demande.commentaire || ''
    }));

    this.reportingService.exportToCSV(data, 'rapport-conges', headers);
  }

  /**
   * Exporte le tableau de bord en PDF
   */
  async exportDashboardToPDF(): Promise<void> {
    try {
      await this.reportingService.exportDashboardToPDF('rh-dashboard-content', 'Tableau de bord RH');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    }
  }


  /**
   * Obtient le nom d'un utilisateur par son ID
   */
  private getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Utilisateur inconnu';
  }

  /**
   * Obtient le texte du statut
   */
  private getStatusText(statut: StatutConge): string {
    switch(statut) {
      case StatutConge.EN_ATTENTE: return 'En attente';
      case StatutConge.ACCEPTE: return 'Acceptée';
      case StatutConge.REJETE: return 'Rejetée';
      default: return statut;
    }
  }
}
