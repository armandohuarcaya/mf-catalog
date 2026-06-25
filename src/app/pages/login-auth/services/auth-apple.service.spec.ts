import { TestBed } from '@angular/core/testing';

import { AuthAppleService } from './auth-apple.service';

describe('AuthAppleService', () => {
  let service: AuthAppleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthAppleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
