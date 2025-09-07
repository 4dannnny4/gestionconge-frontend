
import { Component, OnInit } from '@angular/core';
import { DemandeCongeService } from '../../../core/services/demande-conge.service';
import { DemandeConge, StatutConge } from '../../../core/models/demande-conge.model';
import { AuthService } from '../../../core/services/auth.service';
import { SoldeCongeService } from '../../../core/services/solde-conge.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-demandes',
  templateUrl: './list-demandes.component.html',
  styleUrls: ['./list-demandes.component.css']
})
export class ListDemandesComponent implements OnInit {
  demandes: DemandeConge[] = [];
  filteredDemandes: DemandeConge[] = [];
  loading = true;
  error = '';
  currentUser: any;
  
  // Filtres
  selectedStatut: string = 'all';
  selectedType: string = 'all';
  
  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    acceptees: 0,
    rejetees: 0
  };

  // Colonnes pour le tableau Material
  displayedColumns: string[] = ['id', 'dateDebut', 'dateFin', 'duree', 'type', 'statut', 'commentaire', 'actions'];

  constructor(
    private demandeService: DemandeCongeService,
    private authService: AuthService,
    private soldeCongeService: SoldeCongeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDemandes();
  }

  /**
   * Charge les demandes selon le rôle de l'utilisateur
   */
  loadDemandes() {
    this.loading = true;
    this.error = '';

    // Les employés voient seulement leurs demandes
    // Les managers et RH voient toutes les demandes
    if (this.authService.isEmployee()) {
      this.loadUserDemandes();
    } else {
      this.loadAllDemandes();
    }
  }

  /**
   * Charge les demandes de l'utilisateur connecté
   */
  loadUserDemandes() {
    if (this.currentUser?.userId) {
      this.demandeService.getByUser(this.currentUser.userId).subscribe({
        next: (demandes) => {
          this.demandes = demandes;
          this.applyFilters();
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement de vos demandes';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Charge toutes les demandes (pour managers et RH)
   */
  loadAllDemandes() {
    this.demandeService.getAll().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des demandes';
        this.loading = false;
      }
    });
  }

  getStatusClass(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'bg-warning';
      case 'Accepte': return 'bg-success';
      case 'Rejete': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusChipClass(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'status-warning';
      case 'Accepte': return 'status-success';
      case 'Rejete': return 'status-error';
      default: return 'status-default';
    }
  }

  getStatusIcon(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'schedule';
      case 'Accepte': return 'check_circle';
      case 'Rejete': return 'cancel';
      default: return 'help';
    }
  }

  getStatusText(statut: string): string {
    switch(statut) {
      case 'EnAttente': return 'En attente';
      case 'Accepte': return 'Acceptée';
      case 'Rejete': return 'Rejetée';
      default: return statut;
    }
  }

  editDemande(id: number) {
    this.router.navigate(['/demandes/edit', id]);
  }

  deleteDemande(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      this.demandeService.delete(id).subscribe({
        next: () => {
          this.loadDemandes();
        },
        error: (error) => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  createNewDemande() {
    console.log('Navigation vers /demandes/create');
    console.log('Utilisateur actuel:', this.currentUser);
    console.log('Rôles:', this.currentUser?.roles);
    this.router.navigate(['/demandes/create']).then(
      (success) => console.log('Navigation réussie:', success),
      (error) => console.error('Erreur de navigation:', error)
    );
  }

  /**
   * Applique les filtres sur les demandes
   */
  applyFilters() {
    this.filteredDemandes = this.demandes.filter(demande => {
      const statutMatch = this.selectedStatut === 'all' || demande.statut === this.selectedStatut;
      const typeMatch = this.selectedType === 'all' || demande.type?.id?.toString() === this.selectedType;
      return statutMatch && typeMatch;
    });
  }

  /**
   * Calcule les statistiques des demandes
   */
  calculateStats() {
    this.stats = {
      total: this.demandes.length,
      enAttente: this.demandes.filter(d => d.statut === StatutConge.EN_ATTENTE).length,
      acceptees: this.demandes.filter(d => d.statut === StatutConge.ACCEPTE).length,
      rejetees: this.demandes.filter(d => d.statut === StatutConge.REJETE).length
    };
  }

  /**
   * Calcule la durée en jours ouvrés
   */
  calculateDuration(dateDebut: Date, dateFin: Date): number {
    return this.soldeCongeService.calculerJoursOuvres(new Date(dateDebut), new Date(dateFin));
  }

  /**
   * Filtre les demandes par statut
   */
  onStatutFilterChange() {
    this.applyFilters();
  }

  /**
   * Filtre les demandes par type
   */
  onTypeFilterChange() {
    this.applyFilters();
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters() {
    this.selectedStatut = 'all';
    this.selectedType = 'all';
    this.applyFilters();
  }

  /**
   * Vérifie si l'utilisateur peut modifier une demande
   */
  canEditDemande(demande: DemandeConge): boolean {
    // Un employé peut modifier seulement ses demandes en attente
    if (this.authService.isEmployee()) {
      return demande.userId === this.currentUser?.userId && 
             demande.statut === StatutConge.EN_ATTENTE;
    }
    // Les managers et RH peuvent modifier toutes les demandes
    return this.authService.isManager() || this.authService.isRH();
  }

  /**
   * Vérifie si l'utilisateur peut supprimer une demande
   */
  canDeleteDemande(demande: DemandeConge): boolean {
    // Un employé peut supprimer seulement ses demandes en attente
    if (this.authService.isEmployee()) {
      return demande.userId === this.currentUser?.userId && 
             demande.statut === StatutConge.EN_ATTENTE;
    }
    // Les managers et RH peuvent supprimer toutes les demandes
    return this.authService.isManager() || this.authService.isRH();
  }

  /**
   * Vérifie si l'utilisateur peut valider une demande
   */
  canValidateDemande(demande: DemandeConge): boolean {
    return (this.authService.isManager() || this.authService.isRH()) && 
           demande.statut === StatutConge.EN_ATTENTE;
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
}