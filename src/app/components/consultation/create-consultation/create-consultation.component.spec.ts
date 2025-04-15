import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConsultationComponent } from './create-consultation.component';

describe('CreateConsultationComponent', () => {
  let component: CreateConsultationComponent;
  let fixture: ComponentFixture<CreateConsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateConsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
