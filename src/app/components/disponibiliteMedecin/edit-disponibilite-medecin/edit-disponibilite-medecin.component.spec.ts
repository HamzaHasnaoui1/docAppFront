import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDisponibiliteMedecinComponent } from './edit-disponibilite-medecin.component';

describe('EditDisponibiliteMedecinComponent', () => {
  let component: EditDisponibiliteMedecinComponent;
  let fixture: ComponentFixture<EditDisponibiliteMedecinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDisponibiliteMedecinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDisponibiliteMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
