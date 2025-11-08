import { TestBed } from '@angular/core/testing';

import { Physics } from './physics';

describe('Physics', () => {
  let service: Physics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Physics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
