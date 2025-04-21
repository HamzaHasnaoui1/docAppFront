import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisponibiliteMedecinListComponent } from './disponibilite-medecin-list.component';

describe('DisponibiliteMedecinListComponent', () => {
  let component: DisponibiliteMedecinListComponent;
  let fixture: ComponentFixture<DisponibiliteMedecinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisponibiliteMedecinListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisponibiliteMedecinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
