import { TestBed } from '@angular/core/testing';

import { GoogleCustomSearchService } from './google-custom-search.service';

describe('GoogleCustomSearchService', () => {
  let service: GoogleCustomSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleCustomSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
