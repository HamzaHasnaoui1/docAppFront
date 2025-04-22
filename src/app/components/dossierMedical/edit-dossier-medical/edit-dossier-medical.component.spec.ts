import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDossierMedicalComponent } from './edit-dossier-medical.component';

describe('EditDossierMedicalComponent', () => {
  let component: EditDossierMedicalComponent;
  let fixture: ComponentFixture<EditDossierMedicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDossierMedicalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDossierMedicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
