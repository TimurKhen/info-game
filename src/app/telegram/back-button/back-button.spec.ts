import { TestBed } from '@angular/core/testing';

import { BackButton } from './back-button';

describe('BackButton', () => {
  let service: BackButton;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackButton);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
