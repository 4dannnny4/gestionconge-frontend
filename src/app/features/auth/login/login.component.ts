import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password, rememberMe } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Afficher un message de succès
          this.snackBar.open('Connexion réussie !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Rediriger vers le dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
          
          // Afficher un message d'erreur
          this.snackBar.open(this.errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.loginForm.markAllAsTouched();
    }
  }

  fillTestAccount(username: string, password: string): void {
    this.loginForm.patchValue({
      username: username,
      password: password
    });
    
    // Marquer les champs comme touchés pour activer la validation
    this.loginForm.get('username')?.markAsTouched();
    this.loginForm.get('password')?.markAsTouched();
    
    // Débogage pour voir l'état du formulaire
    console.log('Formulaire après remplissage:', {
      valid: this.loginForm.valid,
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value,
      usernameErrors: this.loginForm.get('username')?.errors,
      passwordErrors: this.loginForm.get('password')?.errors
    });
    
    // Afficher un message informatif
    this.snackBar.open(`Compte de test ${username} rempli`, 'Fermer', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} est requis`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} doit contenir au moins ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    return '';
  }
}