import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrdonnanceComponent } from './create-ordonnance.component';

describe('CreateOrdonnanceComponent', () => {
  let component: CreateOrdonnanceComponent;
  let fixture: ComponentFixture<CreateOrdonnanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrdonnanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrdonnanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
