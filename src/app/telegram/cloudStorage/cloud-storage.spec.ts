import { TestBed } from '@angular/core/testing';
import { CloudStorage } from './cloud-storage';
import { Telegram } from '../telegram';

class MockTelegram {
  isAvailable = false;
  webApp = null;
}

describe('CloudStorage', () => {
  let service: CloudStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CloudStorage,
        { provide: Telegram, useClass: MockTelegram }
      ]
    });
    service = TestBed.inject(CloudStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
