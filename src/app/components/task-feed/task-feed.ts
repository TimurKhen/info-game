import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnswerResult, ApiService, Question } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { Telegram } from '../../telegram/telegram';

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

  private currentTopic: number | undefined;
  private currentDifficulty: number | undefined;
  feedbackState = signal<'correct' | 'incorrect' | null>(null);
  feedbackMessage = signal<string>('');

  constructor(private telegram: Telegram, private apiService: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentTopic = params['topic'] ? Number(params['topic']) : undefined;
      this.currentDifficulty = params['difficulty'] ? Number(params['difficulty']) : undefined;
      // Reset state if params change
      this.tasks.set([]);
      this.currentIndex.set(0);
      this.loadMoreTasks();
    });
  }

  async loadMoreTasks() {
    try {
      const newQuestions = await firstValueFrom(this.apiService.getFeed(this.currentDifficulty, this.currentTopic, 10));
      const newTasks: FeedTask[] = newQuestions.map(q => ({
        ...q,
        selectedOption: null,
        swipeOffset: 0,
        isSwiping: false,
        status: 'pending'
      }));
      this.tasks.update(t => [...t, ...newTasks]);
    } catch (error) {
      console.error('Error loading more tasks:', error);
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
    // Убрали проверку на !task.selectedOption. Теперь свайпать можно всегда.
    if (task.status !== 'pending') return;

    this.startX = event.touches[0].clientX;
    task.isSwiping = true;
    this.updateTask(task);
  }

  onTouchMove(event: TouchEvent, task: FeedTask) {
    if (!task.isSwiping) return;

    this.currentX = event.touches[0].clientX;
    let deltaX = this.currentX - this.startX;

    // Если ответ НЕ выбран, не даем полноценно свайпать влево (на подтверждение).
    // Создаем эффект "резинки" (сильное сопротивление движению влево).
    if (!task.selectedOption && deltaX < 0) {
      deltaX = deltaX * 0.15;
    }

    task.swipeOffset = deltaX;
    this.updateTask(task);
  }

  onTouchEnd(task: FeedTask) {
    if (!task.isSwiping) return;
    task.isSwiping = false;

    // Свайп влево (отрицательный offset) -> Подтвердить (только если ВЫБРАН ОТВЕТ)
    if (task.swipeOffset < -this.SWIPE_THRESHOLD && task.selectedOption) {
      this.confirmTask(task);
    }
    // Свайп вправо (положительный offset) -> Пропустить (можно БЕЗ ответа)
    else if (task.swipeOffset > this.SWIPE_THRESHOLD) {
      this.skipTask(task);
    }
    // Если недотянули или пытались свайпнуть влево без ответа — возвращаем на место
    else {
      task.swipeOffset = 0;
    }

    this.updateTask(task);
  }

  private confirmTask(task: FeedTask) {
    task.swipeOffset = -window.innerWidth;
    task.status = 'confirmed';
    this.updateTask(task);

    if (task.selectedOption !== null) {
      this.apiService.submitAnswer(task.id, task.selectedOption).subscribe({
        next: (res: AnswerResult) => {
          // Assuming the API returns whether the answer was correct.
          // Update `res.isCorrect` to match your actual API response property.
          this.telegram.alerter(JSON.stringify(res));
          const isCorrect = res.correct;
          this.showDynamicIsland(isCorrect);
        },
        error: (e) => {
          console.error('Submit answer failed', e);
          this.showDynamicIsland(false); // Default to error state if request fails
        }
      });
    }

    setTimeout(() => this.nextTask(), 300);
  }

  private showDynamicIsland(isCorrect: boolean) {
    this.feedbackState.set(isCorrect ? 'correct' : 'incorrect');
    this.feedbackMessage.set(isCorrect ? 'Верно!' : 'Неверно!');

    // Hide the dynamic island after 2.5 seconds
    setTimeout(() => {
      this.feedbackState.set(null);
    }, 2500);
  }

  private skipTask(task: FeedTask) {
    task.swipeOffset = window.innerWidth; // Уводим экран вправо
    task.status = 'skipped';
    this.updateTask(task);
    setTimeout(() => this.nextTask(), 300);
  }

  private nextTask() {
    const nextIdx = this.currentIndex() + 1;

    // Check if we reached the end of the feed (no more tasks returned from API)
    if (nextIdx >= this.tasks().length) {
      // Go back to topic selection if feed is empty
      this.router.navigate(['/quiz-start']);
      return;
    }

    this.currentIndex.set(nextIdx);

    if (nextIdx >= this.tasks().length - 3) {
      // TODO:
      //  когда закончились задания - попап об этом
    }
  }
}
