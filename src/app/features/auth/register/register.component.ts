import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleService } from '../../../core/services/role.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  availableRoles: Role[] = [];
  selectedRole: Role | null = null;
  showRoleDropdown = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    
    // Charger les rôles disponibles
    this.loadAvailableRoles();
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value 
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const { username, email, password, role } = this.registerForm.value;

    this.authService.register({ username, email, password, role }).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Compte créé avec succès ! Redirection vers la connexion...';
        
        // Afficher un message de succès
        this.snackBar.open('Compte créé avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de la création du compte';
        
        // Afficher un message d'erreur
        this.snackBar.open('Erreur lors de la création du compte', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Charge les rôles disponibles pour l'inscription
   */
  private loadAvailableRoles(): void {
    this.availableRoles = this.roleService.getAvailableRolesForRegistration();
  }

  /**
   * Obtient le nom d'affichage d'un rôle
   */
  getRoleDisplayName(roleName: string): string {
    return this.roleService.getRoleDisplayName(roleName);
  }

  /**
   * Obtient la description d'un rôle
   */
  getRoleDescription(roleName: string): string {
    return this.roleService.getRoleDescription(roleName);
  }

  /**
   * Obtient l'icône d'un rôle
   */
  getRoleIcon(roleName: string): string {
    return this.roleService.getRoleIcon(roleName);
  }

  /**
   * Bascule l'affichage du dropdown des rôles
   */
  toggleRoleDropdown(): void {
    this.showRoleDropdown = !this.showRoleDropdown;
  }

  /**
   * Sélectionne un rôle
   */
  selectRole(role: Role): void {
    this.selectedRole = role;
    this.registerForm.patchValue({ role: role.nom });
    this.showRoleDropdown = false;
  }
}