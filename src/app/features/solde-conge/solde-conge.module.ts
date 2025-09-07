import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoldeCongeRoutingModule } from './solde-conge-routing.module';
import { SoldeCongeComponent } from './solde-conge.component';

@NgModule({
  declarations: [
    SoldeCongeComponent
  ],
  imports: [
    CommonModule,
    SoldeCongeRoutingModule
  ]
})
export class SoldeCongeModule { }
