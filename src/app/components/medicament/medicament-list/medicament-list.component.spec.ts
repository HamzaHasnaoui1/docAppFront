import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentListComponent } from './medicament-list.component';

describe('MedicamentListComponent', () => {
  let component: MedicamentListComponent;
  let fixture: ComponentFixture<MedicamentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicamentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
