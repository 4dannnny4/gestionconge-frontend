import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CreateDemandeComponent } from './features/demandes/create-demande/create-demande.component';
import { ListDemandesComponent } from './features/demandes/list-demandes/list-demandes.component';
import { ValidationCongeComponent } from './features/validation-conge/validation-conge.component';
import { RhDashboardComponent } from './features/rh-dashboard/rh-dashboard.component';
import { SoldeCongeComponent } from './features/solde-conge/solde-conge.component';
import { ReportsComponent } from './features/reports/reports.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  
  // Routes d'authentification (publiques)
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  
  // Routes protégées par authentification
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  
  // Routes pour les demandes de congés
  {
    path: 'demandes',
    children: [
      { 
        path: 'create', 
        component: CreateDemandeComponent,
        canActivate: [AuthGuard]
      },
      { 
        path: '', 
        component: ListDemandesComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  
  // Route de validation (managers et RH)
  { 
    path: 'validation', 
    component: ValidationCongeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['ROLE_MANAGER', 'ROLE_RH'] }
  },
  
  // Routes RH
  {
    path: 'rh',
    children: [
      { 
        path: 'dashboard', 
        component: RhDashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRoles: ['ROLE_RH'] }
      }
    ]
  },
  
  // Route de gestion des soldes (RH)
  { 
    path: 'soldes', 
    component: SoldeCongeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['ROLE_RH'] }
  },
  
  // Route de reporting (RH et Managers)
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['ROLE_RH', 'ROLE_MANAGER'] }
  },
  
  // Route de fallback
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }