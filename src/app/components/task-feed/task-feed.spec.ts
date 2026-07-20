import { TestBed } from '@angular/core/testing';
import { TaskFeed } from './task-feed';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

class MockApiService {
  getFeed() { return of([]); }
  submitAnswer() { return of({ correct: true, correctOptionId: 1 }); }
}

describe('TaskFeed', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFeed],
      providers: [{ provide: ApiService, useClass: MockApiService }]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskFeed);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
