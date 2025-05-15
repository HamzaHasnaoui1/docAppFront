import { TestBed } from '@angular/core/testing';

import { DonneesPhysiologiquesService } from './donnees-physiologiques.service';

describe('DonneesPhysiologiquesService', () => {
  let service: DonneesPhysiologiquesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DonneesPhysiologiquesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
