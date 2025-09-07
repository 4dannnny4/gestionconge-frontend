import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemandeCongeService } from '../../../core/services/demande-conge.service';
import { TypeCongeService } from '../../../core/services/type-conge.service';
import { SoldeCongeService } from '../../../core/services/solde-conge.service';
import { AuthService } from '../../../core/services/auth.service';
import { TypeConge } from '../../../core/models/type-conge.model';
import { DemandeConge, StatutConge, CreateDemandeCongeRequest } from '../../../core/models/demande-conge.model';

@Component({
  selector: 'app-create-demande',
  templateUrl: './create-demande.component.html',
  styleUrls: ['./create-demande.component.css']
})
export class CreateDemandeComponent implements OnInit {
  demandeForm!: FormGroup;
  typesConge: TypeConge[] = [];
  loading = false;
  error = '';
  success = '';
  joursOuvres = 0;
  soldeRestant = 0;

  constructor(
    private formBuilder: FormBuilder,
    private demandeService: DemandeCongeService,
    private typeCongeService: TypeCongeService,
    private soldeCongeService: SoldeCongeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadTypesConge();
    this.loadSoldeUtilisateur();
    
    // Écouter les changements de dates pour calculer les jours ouvrés
    this.demandeForm.get('dateDebut')?.valueChanges.subscribe(() => {
      this.calculerJoursOuvres();
    });
    
    this.demandeForm.get('dateFin')?.valueChanges.subscribe(() => {
      this.calculerJoursOuvres();
    });
  }

  initForm() {
    this.demandeForm = this.formBuilder.group({
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      typeId: ['', Validators.required],
      commentaire: ['']
    }, { validators: this.dateValidator });
  }

  dateValidator(formGroup: FormGroup) {
    const dateDebut = formGroup.get('dateDebut')?.value;
    const dateFin = formGroup.get('dateFin')?.value;
    
    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (debut < today) {
        return { dateDebutPassed: true };
      }
      
      if (fin <= debut) {
        return { dateFinInvalid: true };
      }
    }
    
    return null;
  }

  loadTypesConge() {
    this.typeCongeService.getAll().subscribe({
      next: (types) => {
        this.typesConge = types;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des types de congés';
      }
    });
  }

  /**
   * Charge le solde de congés de l'utilisateur connecté
   */
  loadSoldeUtilisateur(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.userId) {
      this.soldeCongeService.getByUser(currentUser.userId).subscribe({
        next: (solde) => {
          this.soldeRestant = solde.restant;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du solde:', error);
        }
      });
    }
  }

  /**
   * Calcule le nombre de jours ouvrés entre les dates sélectionnées
   */
  calculerJoursOuvres(): void {
    const dateDebut = this.demandeForm.get('dateDebut')?.value;
    const dateFin = this.demandeForm.get('dateFin')?.value;
    
    if (dateDebut && dateFin) {
      this.joursOuvres = this.soldeCongeService.calculerJoursOuvres(
        new Date(dateDebut), 
        new Date(dateFin)
      );
    } else {
      this.joursOuvres = 0;
    }
  }

  calculateDuration(): number {
    return this.joursOuvres;
  }

  onSubmit() {
    if (this.demandeForm.invalid) {
      this.markFormGroupTouched(this.demandeForm);
      return;
    }

    // Vérifier si l'utilisateur a assez de jours de congé
    if (this.joursOuvres > this.soldeRestant) {
      this.error = `Solde insuffisant. Vous demandez ${this.joursOuvres} jours mais il ne vous reste que ${this.soldeRestant} jours.`;
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = this.demandeForm.value;
    const demandeData: CreateDemandeCongeRequest = {
      dateDebut: new Date(formValue.dateDebut),
      dateFin: new Date(formValue.dateFin),
      typeId: formValue.typeId,
      commentaire: formValue.commentaire || undefined
    };

    this.demandeService.create(demandeData).subscribe({
      next: (response) => {
        this.success = 'Demande créée avec succès !';
        setTimeout(() => {
          this.router.navigate(['/demandes']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors de la création de la demande';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  cancel() {
    this.router.navigate(['/demandes']);
  }
}