import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAddActionsComponent } from './search-add-actions.component';

describe('SearchAddActionsComponent', () => {
  let component: SearchAddActionsComponent;
  let fixture: ComponentFixture<SearchAddActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAddActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchAddActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
