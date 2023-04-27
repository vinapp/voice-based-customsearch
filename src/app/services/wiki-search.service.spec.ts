import { TestBed } from '@angular/core/testing';

import { WikiSearchService } from './wiki-search.service';

describe('WikiSearchService', () => {
  let service: WikiSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WikiSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
