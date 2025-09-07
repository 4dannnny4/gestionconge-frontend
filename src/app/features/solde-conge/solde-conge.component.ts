import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SoldeCongeService } from '../../core/services/solde-conge.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SoldeConge } from '../../core/models/solde-conge.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-solde-conge',
  templateUrl: './solde-conge.component.html',
  styleUrls: ['./solde-conge.component.css']
})
export class SoldeCongeComponent implements OnInit {
  soldes: SoldeConge[] = [];
  users: User[] = [];
  currentUserSolde: SoldeConge | null = null;
  
  loading = true;
  error = '';
  success = '';
  
  // Formulaire pour créer/modifier un solde
  soldeForm: FormGroup;
  showForm = false;
  editingSolde: SoldeConge | null = null;

  constructor(
    private soldeCongeService: SoldeCongeService,
    private userService: UserService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.soldeForm = this.formBuilder.group({
      userId: ['', Validators.required],
      totalAnnuel: ['', [Validators.required, Validators.min(0)]],
      restant: ['', [Validators.required, Validators.min(0)]],
      utilise: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge toutes les données nécessaires
   */
  loadData(): void {
    this.loading = true;
    this.error = '';

    // Charger les soldes et les utilisateurs en parallèle
    Promise.all([
      this.loadSoldes(),
      this.loadUsers(),
      this.loadCurrentUserSolde()
    ]).then(() => {
      this.loading = false;
    }).catch(error => {
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
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
   * Charge le solde de l'utilisateur connecté
   */
  private loadCurrentUserSolde(): Promise<void> {
    return new Promise((resolve, reject) => {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.userId) {
        this.soldeCongeService.getByUser(currentUser.userId).subscribe({
          next: (solde) => {
            this.currentUserSolde = solde;
            resolve();
          },
          error: (error) => {
            console.error('Erreur lors du chargement du solde utilisateur:', error);
            resolve(); // Ne pas faire échouer le chargement global
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Ouvre le formulaire pour créer un nouveau solde
   */
  openCreateForm(): void {
    this.editingSolde = null;
    this.soldeForm.reset();
    this.showForm = true;
  }

  /**
   * Ouvre le formulaire pour modifier un solde existant
   */
  openEditForm(solde: SoldeConge): void {
    this.editingSolde = solde;
    this.soldeForm.patchValue({
      userId: solde.id,
      totalAnnuel: solde.totalAnnuel,
      restant: solde.restant,
      utilise: solde.utilise
    });
    this.showForm = true;
  }

  /**
   * Ferme le formulaire
   */
  closeForm(): void {
    this.showForm = false;
    this.editingSolde = null;
    this.soldeForm.reset();
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    if (this.soldeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = this.soldeForm.value;
    const soldeData: SoldeConge = {
      id: this.editingSolde?.id,
      totalAnnuel: formValue.totalAnnuel,
      restant: formValue.restant,
      utilise: formValue.utilise
    };

    if (this.editingSolde) {
      // Modification
      this.soldeCongeService.update(this.editingSolde.id!, soldeData).subscribe({
        next: (response) => {
          this.success = 'Solde mis à jour avec succès !';
          this.closeForm();
          this.loadData();
        },
        error: (error) => {
          this.error = error.error?.message || 'Erreur lors de la mise à jour';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // Création
      this.soldeCongeService.create(soldeData).subscribe({
        next: (response) => {
          this.success = 'Solde créé avec succès !';
          this.closeForm();
          this.loadData();
        },
        error: (error) => {
          this.error = error.error?.message || 'Erreur lors de la création';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  /**
   * Supprime un solde
   */
  deleteSolde(solde: SoldeConge): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce solde ?')) {
      this.loading = true;
      this.soldeCongeService.delete(solde.id!).subscribe({
        next: () => {
          this.success = 'Solde supprimé avec succès !';
          this.loadData();
        },
        error: (error) => {
          this.error = 'Erreur lors de la suppression';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  /**
   * Obtient le nom d'un utilisateur par son ID
   */
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Utilisateur inconnu';
  }

  /**
   * Calcule le pourcentage d'utilisation
   */
  getUtilizationPercentage(solde: SoldeConge): number {
    if (solde.totalAnnuel === 0) return 0;
    return Math.round((solde.utilise / solde.totalAnnuel) * 100);
  }

  /**
   * Obtient la classe CSS pour le pourcentage d'utilisation
   */
  getUtilizationClass(percentage: number): string {
    if (percentage >= 80) return 'text-danger';
    if (percentage >= 60) return 'text-warning';
    return 'text-success';
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.soldeForm.controls).forEach(key => {
      const control = this.soldeForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifie si l'utilisateur peut gérer les soldes
   */
  canManageSoldes(): boolean {
    return this.authService.isRH();
  }

  /**
   * Actualise les données
   */
  refreshData(): void {
    this.loadData();
  }
}
