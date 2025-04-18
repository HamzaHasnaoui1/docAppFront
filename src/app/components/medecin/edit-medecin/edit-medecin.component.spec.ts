import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMedecinComponent } from './edit-medecin.component';

describe('EditMedecinComponent', () => {
  let component: EditMedecinComponent;
  let fixture: ComponentFixture<EditMedecinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMedecinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMedecinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
