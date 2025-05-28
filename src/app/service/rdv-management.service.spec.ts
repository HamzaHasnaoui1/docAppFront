import { TestBed } from '@angular/core/testing';

import { RdvManagementService } from './rdv-management.service';

describe('RdvManagementService', () => {
  let service: RdvManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RdvManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
