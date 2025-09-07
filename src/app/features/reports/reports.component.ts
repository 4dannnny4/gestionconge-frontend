import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DemandeCongeService } from '../../core/services/demande-conge.service';
import { SoldeCongeService } from '../../core/services/solde-conge.service';
import { UserService } from '../../core/services/user.service';
import { ReportingService } from '../../core/services/reporting.service';
import { AuthService } from '../../core/services/auth.service';
import { DemandeConge, StatutConge } from '../../core/models/demande-conge.model';
import { SoldeConge } from '../../core/models/solde-conge.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  // Données
  demandes: DemandeConge[] = [];
  soldes: SoldeConge[] = [];
  users: User[] = [];
  
  // Formulaire de filtres
  reportForm: FormGroup;
  
  // États
  loading = false;
  error = '';
  success = '';
  
  // États des dropdowns
  showReportTypeDropdown = false;
  showStatutDropdown = false;
  showUserDropdown = false;
  
  // Sélections
  selectedReportType: any = null;
  selectedStatut: any = null;
  selectedUser: any = null;
  
  // Types de rapports
  reportTypes = [
    { value: 'demandes', label: 'Rapport des demandes', icon: 'fas fa-calendar-alt' },
    { value: 'soldes', label: 'Rapport des soldes', icon: 'fas fa-chart-bar' },
    { value: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-tachometer-alt' },
    { value: 'monthly', label: 'Rapport mensuel', icon: 'fas fa-calendar-week' },
    { value: 'annual', label: 'Rapport annuel', icon: 'fas fa-calendar' }
  ];

  // Filtres
  statutFilters = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'EnAttente', label: 'En attente' },
    { value: 'Accepte', label: 'Acceptées' },
    { value: 'Rejete', label: 'Rejetées' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private demandeCongeService: DemandeCongeService,
    private soldeCongeService: SoldeCongeService,
    private userService: UserService,
    private reportingService: ReportingService,
    private authService: AuthService
  ) {
    this.reportForm = this.formBuilder.group({
      reportType: ['demandes', Validators.required],
      statut: ['all'],
      user: ['all'],
      dateDebut: [''],
      dateFin: [''],
      month: [new Date().getMonth()],
      year: [new Date().getFullYear()]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.initializeDefaults();
  }

  /**
   * Initialise les valeurs par défaut
   */
  private initializeDefaults(): void {
    // Sélectionner le premier type de rapport par défaut
    if (this.reportTypes.length > 0) {
      this.selectedReportType = this.reportTypes[0];
    }
    
    // Sélectionner "Tous les statuts" par défaut
    if (this.statutFilters.length > 0) {
      this.selectedStatut = this.statutFilters[0];
    }
    
    // Sélectionner "Tous les utilisateurs" par défaut
    this.selectedUser = { id: 'all', username: 'Tous les utilisateurs' };
  }

  /**
   * Charge toutes les données nécessaires
   */
  loadData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.loadDemandes(),
      this.loadSoldes(),
      this.loadUsers()
    ]).then(() => {
      this.loading = false;
    }).catch(error => {
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
    });
  }

  /**
   * Charge toutes les demandes
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
   * Charge tous les soldes
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
   * Génère le rapport sélectionné
   */
  async generateReport(): Promise<void> {
    if (this.reportForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const formValue = this.reportForm.value;
      
      switch (formValue.reportType) {
        case 'demandes':
          await this.generateDemandesReport(formValue);
          break;
        case 'soldes':
          await this.generateSoldesReport();
          break;
        case 'dashboard':
          await this.generateDashboardReport();
          break;
        case 'monthly':
          await this.generateMonthlyReport(formValue);
          break;
        case 'annual':
          await this.generateAnnualReport(formValue);
          break;
        default:
          throw new Error('Type de rapport non supporté');
      }
      
      this.success = 'Rapport généré avec succès !';
    } catch (error: any) {
      this.error = error.message || 'Erreur lors de la génération du rapport';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Génère le rapport des demandes
   */
  private async generateDemandesReport(filters: any): Promise<void> {
    let filteredDemandes = [...this.demandes];

    // Filtrer par statut
    if (filters.statut !== 'all') {
      filteredDemandes = filteredDemandes.filter(d => d.statut === filters.statut);
    }

    // Filtrer par utilisateur
    if (filters.user !== 'all') {
      filteredDemandes = filteredDemandes.filter(d => d.userId?.toString() === filters.user);
    }

    // Filtrer par dates
    if (filters.dateDebut) {
      const dateDebut = new Date(filters.dateDebut);
      filteredDemandes = filteredDemandes.filter(d => new Date(d.dateDebut) >= dateDebut);
    }

    if (filters.dateFin) {
      const dateFin = new Date(filters.dateFin);
      filteredDemandes = filteredDemandes.filter(d => new Date(d.dateDebut) <= dateFin);
    }

    const title = this.getReportTitle('demandes', filters);
    await this.reportingService.exportDemandesToPDF(filteredDemandes, this.users, title);
  }

  /**
   * Génère le rapport des soldes
   */
  private async generateSoldesReport(): Promise<void> {
    const title = 'Rapport des soldes de congés';
    await this.reportingService.exportSoldesToPDF(this.soldes, this.users, title);
  }

  /**
   * Génère le rapport du tableau de bord
   */
  private async generateDashboardReport(): Promise<void> {
    const title = 'Tableau de bord RH';
    await this.reportingService.exportDashboardToPDF('rh-dashboard-content', title);
  }

  /**
   * Génère le rapport mensuel
   */
  private async generateMonthlyReport(filters: any): Promise<void> {
    await this.reportingService.generateMonthlyReport(this.demandes, this.users, filters.month, filters.year);
  }

  /**
   * Génère le rapport annuel
   */
  private async generateAnnualReport(filters: any): Promise<void> {
    await this.reportingService.generateAnnualReport(this.demandes, this.users, filters.year);
  }

  /**
   * Exporte les données en CSV
   */
  exportToCSV(): void {
    const formValue = this.reportForm.value;
    
    switch (formValue.reportType) {
      case 'demandes':
        this.exportDemandesCSV(formValue);
        break;
      case 'soldes':
        this.exportSoldesCSV();
        break;
      default:
        this.error = 'Export CSV non disponible pour ce type de rapport';
    }
  }

  /**
   * Exporte les demandes en CSV
   */
  private exportDemandesCSV(filters: any): void {
    let filteredDemandes = [...this.demandes];

    // Appliquer les mêmes filtres que pour le PDF
    if (filters.statut !== 'all') {
      filteredDemandes = filteredDemandes.filter(d => d.statut === filters.statut);
    }

    if (filters.user !== 'all') {
      filteredDemandes = filteredDemandes.filter(d => d.userId?.toString() === filters.user);
    }

    const headers = ['Utilisateur', 'Type', 'Date début', 'Date fin', 'Statut', 'Commentaire'];
    const data = filteredDemandes.map(demande => ({
      'Utilisateur': this.getUserName(demande.userId!),
      'Type': demande.type?.nom || 'N/A',
      'Date début': new Date(demande.dateDebut).toLocaleDateString('fr-FR'),
      'Date fin': new Date(demande.dateFin).toLocaleDateString('fr-FR'),
      'Statut': this.getStatusText(demande.statut!),
      'Commentaire': demande.commentaire || '-'
    }));

    this.reportingService.exportToCSV(data, 'rapport-demandes', headers);
  }

  /**
   * Exporte les soldes en CSV
   */
  private exportSoldesCSV(): void {
    const headers = ['Utilisateur', 'Total annuel', 'Utilisé', 'Restant', '% Utilisé'];
    const data = this.soldes.map(solde => {
      const user = this.users.find(u => u.id === solde.id);
      const pourcentageUtilise = solde.totalAnnuel > 0 ? Math.round((solde.utilise / solde.totalAnnuel) * 100) : 0;
      
      return {
        'Utilisateur': user?.username || 'N/A',
        'Total annuel': solde.totalAnnuel,
        'Utilisé': solde.utilise,
        'Restant': solde.restant,
        '% Utilisé': pourcentageUtilise
      };
    });

    this.reportingService.exportToCSV(data, 'rapport-soldes', headers);
  }

  /**
   * Obtient le nom d'un utilisateur par son ID
   */
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Utilisateur inconnu';
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
   * Génère le titre du rapport
   */
  private getReportTitle(type: string, filters: any): string {
    let title = 'Rapport des demandes de congés';
    
    if (filters.statut !== 'all') {
      title += ` - ${this.getStatusText(filters.statut)}`;
    }
    
    if (filters.user !== 'all') {
      const user = this.users.find(u => u.id?.toString() === filters.user);
      title += ` - ${user?.username || 'Utilisateur'}`;
    }
    
    if (filters.dateDebut && filters.dateFin) {
      title += ` - ${new Date(filters.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(filters.dateFin).toLocaleDateString('fr-FR')}`;
    }
    
    return title;
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.reportForm.controls).forEach(key => {
      const control = this.reportForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifie si l'utilisateur peut accéder aux rapports
   */
  canAccessReports(): boolean {
    return this.authService.isRH() || this.authService.isManager();
  }

  /**
   * Actualise les données
   */
  refreshData(): void {
    this.loadData();
  }

  /**
   * Obtient les années disponibles pour les rapports
   */
  getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }

  /**
   * Obtient les demandes filtrées selon les critères du formulaire
   */
  getFilteredDemandes(): DemandeConge[] {
    let filteredDemandes = [...this.demandes];
    const formValue = this.reportForm.value;

    // Filtrer par statut
    if (formValue.statut !== 'all') {
      filteredDemandes = filteredDemandes.filter(d => d.statut === formValue.statut);
    }

    // Filtrer par utilisateur
    if (formValue.user !== 'all') {
      filteredDemandes = filteredDemandes.filter(d => d.userId?.toString() === formValue.user);
    }

    // Filtrer par dates
    if (formValue.dateDebut) {
      const dateDebut = new Date(formValue.dateDebut);
      filteredDemandes = filteredDemandes.filter(d => new Date(d.dateDebut) >= dateDebut);
    }

    if (formValue.dateFin) {
      const dateFin = new Date(formValue.dateFin);
      filteredDemandes = filteredDemandes.filter(d => new Date(d.dateDebut) <= dateFin);
    }

    return filteredDemandes;
  }

  /**
   * Obtient le nombre de demandes en attente
   */
  getDemandesEnAttente(): number {
    return this.demandes.filter(d => d.statut === StatutConge.EN_ATTENTE).length;
  }

  /**
   * Obtient le nombre de demandes acceptées
   */
  getDemandesAcceptees(): number {
    return this.demandes.filter(d => d.statut === StatutConge.ACCEPTE).length;
  }

  /**
   * Obtient le nombre de demandes rejetées
   */
  getDemandesRejetees(): number {
    return this.demandes.filter(d => d.statut === StatutConge.REJETE).length;
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
   * Obtient la classe CSS pour le chip de statut
   */
  getStatusChipClass(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'status-pending';
      case 'Accepte': return 'status-approved';
      case 'Rejete': return 'status-rejected';
      default: return 'status-pending';
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
   * Obtient l'icône pour le type de rapport
   */
  getReportTypeIcon(type: string): string {
    switch(type) {
      case 'demandes': return 'event';
      case 'soldes': return 'account_balance_wallet';
      case 'dashboard': return 'dashboard';
      case 'monthly': return 'calendar_month';
      case 'annual': return 'calendar_today';
      default: return 'assessment';
    }
  }

  /**
   * Colonnes du tableau d'aperçu
   */
  previewColumns = ['utilisateur', 'type', 'dateDebut', 'dateFin', 'statut', 'commentaire'];

  /**
   * Toggle dropdown pour le type de rapport
   */
  toggleReportTypeDropdown(): void {
    this.showReportTypeDropdown = !this.showReportTypeDropdown;
    this.showStatutDropdown = false;
    this.showUserDropdown = false;
  }

  /**
   * Toggle dropdown pour le statut
   */
  toggleStatutDropdown(): void {
    this.showStatutDropdown = !this.showStatutDropdown;
    this.showReportTypeDropdown = false;
    this.showUserDropdown = false;
  }

  /**
   * Toggle dropdown pour l'utilisateur
   */
  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    this.showReportTypeDropdown = false;
    this.showStatutDropdown = false;
  }

  /**
   * Sélectionner un type de rapport
   */
  selectReportType(type: any): void {
    this.selectedReportType = type;
    this.reportForm.patchValue({ reportType: type.value });
    this.showReportTypeDropdown = false;
  }

  /**
   * Sélectionner un statut
   */
  selectStatut(statut: any): void {
    this.selectedStatut = statut;
    this.reportForm.patchValue({ statut: statut.value });
    this.showStatutDropdown = false;
  }

  /**
   * Sélectionner un utilisateur
   */
  selectUser(user: any): void {
    this.selectedUser = user;
    this.reportForm.patchValue({ user: user.id });
    this.showUserDropdown = false;
  }

  /**
   * Obtient la description du type de rapport
   */
  getReportTypeDescription(type: string): string {
    switch(type) {
      case 'demandes': return 'Liste détaillée des demandes de congés';
      case 'soldes': return 'État des soldes de congés par utilisateur';
      case 'dashboard': return 'Vue d\'ensemble du tableau de bord RH';
      case 'monthly': return 'Rapport mensuel des congés';
      case 'annual': return 'Rapport annuel des congés';
      default: return 'Rapport personnalisé';
    }
  }
}
