import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMedicamentComponent } from './create-medicament.component';

describe('CreateMedicamentComponent', () => {
  let component: CreateMedicamentComponent;
  let fixture: ComponentFixture<CreateMedicamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMedicamentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMedicamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
