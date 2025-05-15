import { TestBed } from '@angular/core/testing';

import { OrdonnanceMedicamentService } from './ordonnance-medicament.service';

describe('OrdonnanceMedicamentService', () => {
  let service: OrdonnanceMedicamentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdonnanceMedicamentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
