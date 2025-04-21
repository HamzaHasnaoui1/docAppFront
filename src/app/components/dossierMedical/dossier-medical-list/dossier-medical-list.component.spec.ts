import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierMedicalListComponent } from './dossier-medical-list.component';

describe('DossierMedicalListComponent', () => {
  let component: DossierMedicalListComponent;
  let fixture: ComponentFixture<DossierMedicalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierMedicalListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierMedicalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
