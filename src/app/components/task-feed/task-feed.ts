import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Question } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

export interface FeedTask extends Question {
  selectedOption: number | null;
  swipeOffset: number;
  isSwiping: boolean;
  status: 'pending' | 'confirmed' | 'skipped';
}

@Component({
  selector: 'app-task-feed',
  imports: [CommonModule],
  templateUrl: './task-feed.html',
  styleUrl: './task-feed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFeed implements OnInit {
  tasks = signal<FeedTask[]>([]);
  currentIndex = signal<number>(0);

  currentTask = computed(() => {
    const allTasks = this.tasks();
    const index = this.currentIndex();
    return index < allTasks.length ? allTasks[index] : null;
  });

  // Переменные для отслеживания свайпа
  private startX = 0;
  private currentX = 0;
  private readonly SWIPE_THRESHOLD = 120; // Пикселей для срабатывания

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMoreTasks();
  }

  async loadMoreTasks() {
    try {
      const newQuestions = await firstValueFrom(this.apiService.getFeed(undefined, undefined, 10));
      const newTasks: FeedTask[] = newQuestions.map(q => ({
        ...q,
        selectedOption: null,
        swipeOffset: 0,
        isSwiping: false,
        status: 'pending'
      }));
      this.tasks.update(t => [...t, ...newTasks]);
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  }

  selectOption(task: FeedTask, optionId: number) {
    if (task.status !== 'pending') return;
    task.selectedOption = optionId;
    this.updateTask(task);
  }

  private updateTask(updatedTask: FeedTask) {
    this.tasks.update(tasks => tasks.map(t => t.id === updatedTask.id ? { ...updatedTask } : t));
  }

  // === Логика свайпов ===

  getTransform(task: FeedTask): string {
    const rotation = task.swipeOffset * 0.05; // 5 degrees per 100px
    return `translateX(${task.swipeOffset}px) rotateZ(${rotation}deg)`;
  }

  onTouchStart(event: TouchEvent, task: FeedTask) {
    // Свайпать можно только если выбран вариант ответа
    if (!task.selectedOption || task.status !== 'pending') return;

    this.startX = event.touches[0].clientX;
    task.isSwiping = true;
    this.updateTask(task);
  }

  onTouchMove(event: TouchEvent, task: FeedTask) {
    if (!task.isSwiping) return;

    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.startX;

    // Блокируем свайп, если он слишком слабый (защита от случайных дрожаний)
    task.swipeOffset = deltaX;
    this.updateTask(task);
  }

  onTouchEnd(task: FeedTask) {
    if (!task.isSwiping) return;
    task.isSwiping = false;

    // Свайп влево (отрицательный offset) -> Подтвердить (Confirm)
    if (task.swipeOffset < -this.SWIPE_THRESHOLD) {
      this.confirmTask(task);
    }
    // Свайп вправо (положительный offset) -> Пропустить (Skip)
    else if (task.swipeOffset > this.SWIPE_THRESHOLD) {
      this.skipTask(task);
    }
    // Возврат в исходное положение
    else {
      task.swipeOffset = 0;
    }
  }

  private confirmTask(task: FeedTask) {
    task.swipeOffset = -window.innerWidth; // Уводим экран влево
    task.status = 'confirmed';
    this.updateTask(task);

    if (task.selectedOption !== null) {
      // Fire the API call asynchronously without blocking the UI transition
      this.apiService.submitAnswer(task.id, { optionId: task.selectedOption }).subscribe({
        error: (e) => console.error('Submit answer failed', e)
      });
    }

    setTimeout(() => this.nextTask(), 300);
  }

  private skipTask(task: FeedTask) {
    task.swipeOffset = window.innerWidth; // Уводим экран вправо
    task.status = 'skipped';
    this.updateTask(task);
    setTimeout(() => this.nextTask(), 300);
  }

  private nextTask() {
    const nextIdx = this.currentIndex() + 1;
    this.currentIndex.set(nextIdx);

    // Load more when approaching the end
    if (nextIdx >= this.tasks().length - 3) {
      this.loadMoreTasks();
    }
  }
}
