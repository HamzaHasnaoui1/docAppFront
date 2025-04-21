import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePaiementComponent } from './create-paiement.component';

describe('CreatePaiementComponent', () => {
  let component: CreatePaiementComponent;
  let fixture: ComponentFixture<CreatePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
