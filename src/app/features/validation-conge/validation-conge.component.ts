import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeCongeService } from '../../core/services/demande-conge.service';
import { SoldeCongeService } from '../../core/services/solde-conge.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { DemandeConge, StatutConge } from '../../core/models/demande-conge.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-validation-conge',
  templateUrl: './validation-conge.component.html',
  styleUrls: ['./validation-conge.component.css']
})
export class ValidationCongeComponent implements OnInit {
  demandes: DemandeConge[] = [];
  filteredDemandes: DemandeConge[] = [];
  loading = true;
  error = '';
  success = '';
  
  // Filtres
  selectedStatut: string = 'EnAttente';
  selectedUser: string = 'all';
  
  // Utilisateurs pour le filtre
  users: User[] = [];
  
  // Modal de validation
  selectedDemande: DemandeConge | null = null;
  validationComment = '';
  showValidationModal = false;

  // Colonnes pour le tableau Material
  displayedColumns: string[] = ['id', 'user', 'dateDebut', 'dateFin', 'duree', 'type', 'commentaire', 'actions'];

  constructor(
    private demandeCongeService: DemandeCongeService,
    private soldeCongeService: SoldeCongeService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
    this.loadUsers();
  }

  /**
   * Charge toutes les demandes en attente de validation
   */
  loadDemandes() {
    console.log('🔍 ValidationCongeComponent.loadDemandes() - Début du chargement');
    this.loading = true;
    this.error = '';
    
    this.demandeCongeService.getByStatut(StatutConge.EN_ATTENTE).subscribe({
      next: (demandes) => {
        console.log('✅ ValidationCongeComponent.loadDemandes() - Demandes reçues:', demandes);
        this.demandes = demandes;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ ValidationCongeComponent.loadDemandes() - Erreur:', error);
        this.error = 'Erreur lors du chargement des demandes';
        this.loading = false;
      }
    });
  }

  /**
   * Charge la liste des utilisateurs pour le filtre
   */
  loadUsers() {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  /**
   * Applique les filtres sur les demandes
   */
  applyFilters() {
    this.filteredDemandes = this.demandes.filter(demande => {
      const statutMatch = this.selectedStatut === 'all' || demande.statut === this.selectedStatut;
      const userMatch = this.selectedUser === 'all' || demande.userId?.toString() === this.selectedUser;
      return statutMatch && userMatch;
    });
  }

  /**
   * Ouvre le modal de validation
   */
  openValidationModal(demande: DemandeConge, action: 'accept' | 'reject') {
    this.selectedDemande = demande;
    this.validationComment = '';
    this.showValidationModal = true;
  }

  /**
   * Ferme le modal de validation
   */
  closeValidationModal() {
    this.showValidationModal = false;
    this.selectedDemande = null;
    this.validationComment = '';
  }

  /**
   * Valide une demande de congé
   */
  validerDemande() {
    if (!this.selectedDemande) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.demandeCongeService.validerDemande(this.selectedDemande.id!, this.validationComment).subscribe({
      next: (response) => {
        this.success = 'Demande validée avec succès !';
        this.closeValidationModal();
        this.loadDemandes();
        
        // Mettre à jour le solde de l'utilisateur
        if (this.selectedDemande?.userId) {
          const joursUtilises = this.calculerJoursOuvres(
            this.selectedDemande.dateDebut, 
            this.selectedDemande.dateFin
          );
          this.soldeCongeService.updateSoldeAfterValidation(
            this.selectedDemande.userId, 
            joursUtilises
          ).subscribe();
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors de la validation';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Rejette une demande de congé
   */
  rejeterDemande() {
    if (!this.selectedDemande || !this.validationComment.trim()) {
      this.error = 'Veuillez indiquer le motif du rejet';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.demandeCongeService.rejeterDemande(this.selectedDemande.id!, this.validationComment).subscribe({
      next: (response) => {
        this.success = 'Demande rejetée avec succès !';
        this.closeValidationModal();
        this.loadDemandes();
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors du rejet';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Calcule le nombre de jours ouvrés
   */
  calculerJoursOuvres(dateDebut: Date, dateFin: Date): number {
    return this.soldeCongeService.calculerJoursOuvres(new Date(dateDebut), new Date(dateFin));
  }

  /**
   * Obtient le nom d'un utilisateur par son ID
   */
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Utilisateur inconnu';
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
   * Filtre les demandes par statut
   */
  onStatutFilterChange() {
    this.applyFilters();
  }

  /**
   * Filtre les demandes par utilisateur
   */
  onUserFilterChange() {
    this.applyFilters();
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters() {
    this.selectedStatut = 'EnAttente';
    this.selectedUser = 'all';
    this.applyFilters();
  }

  /**
   * Alias pour accepter une demande
   */
  accepter(demande: DemandeConge) {
    this.openValidationModal(demande, 'accept');
  }

  /**
   * Alias pour refuser une demande
   */
  refuser(demande: DemandeConge) {
    this.openValidationModal(demande, 'reject');
  }
}
