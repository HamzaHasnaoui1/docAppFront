import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRdvComponent } from './create-rdv.component';

describe('CreateRdvComponent', () => {
  let component: CreateRdvComponent;
  let fixture: ComponentFixture<CreateRdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRdvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
