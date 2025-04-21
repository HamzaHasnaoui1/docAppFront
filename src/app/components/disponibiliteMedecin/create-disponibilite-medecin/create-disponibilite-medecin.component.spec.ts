import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDisponibiliteMedecinComponent } from './create-disponibilite-medecin.component';

describe('CreateDisponibiliteMedecinComponent', () => {
  let component: CreateDisponibiliteMedecinComponent;
  let fixture: ComponentFixture<CreateDisponibiliteMedecinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDisponibiliteMedecinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDisponibiliteMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
