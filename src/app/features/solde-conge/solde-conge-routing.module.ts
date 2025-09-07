import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SoldeCongeComponent } from './solde-conge.component';

const routes: Routes = [{ path: '', component: SoldeCongeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoldeCongeRoutingModule { }
