import { TestBed } from '@angular/core/testing';

import { SCatalogService } from './s-catalog.service';

describe('SCatalogService', () => {
  let service: SCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
