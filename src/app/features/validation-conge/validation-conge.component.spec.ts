import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationCongeComponent } from './validation-conge.component';

describe('ValidationCongeComponent', () => {
  let component: ValidationCongeComponent;
  let fixture: ComponentFixture<ValidationCongeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationCongeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationCongeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
