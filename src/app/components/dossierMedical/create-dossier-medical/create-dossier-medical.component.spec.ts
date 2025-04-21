import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDossierMedicalComponent } from './create-dossier-medical.component';

describe('CreateDossierMedicalComponent', () => {
  let component: CreateDossierMedicalComponent;
  let fixture: ComponentFixture<CreateDossierMedicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDossierMedicalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDossierMedicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
