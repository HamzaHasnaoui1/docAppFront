import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RdvListComponent } from './rdv-list.component';

describe('RdvListComponent', () => {
  let component: RdvListComponent;
  let fixture: ComponentFixture<RdvListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RdvListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RdvListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
