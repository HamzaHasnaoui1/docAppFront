import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierMedicalDetailComponent } from './dossier-medical-detail.component';

describe('DossierMedicalDetailComponent', () => {
  let component: DossierMedicalDetailComponent;
  let fixture: ComponentFixture<DossierMedicalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierMedicalDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierMedicalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
