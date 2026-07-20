import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFeed } from './task-feed';

describe('TaskFeed', () => {
  let component: TaskFeed;
  let fixture: ComponentFixture<TaskFeed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFeed],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFeed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
