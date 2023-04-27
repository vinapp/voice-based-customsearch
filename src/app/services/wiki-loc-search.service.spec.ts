import { TestBed } from '@angular/core/testing';

import { WikiLocSearchService } from './wiki-loc-search.service';

describe('WikiLocSearchService', () => {
  let service: WikiLocSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WikiLocSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
