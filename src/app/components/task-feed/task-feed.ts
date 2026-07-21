import { Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnswerResult, ApiService, Question } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { Telegram } from '../../telegram/telegram';
import { QuizStateService } from '../../services/quiz-state.service';
import { MatRipple } from '@angular/material/core';
import { BackButton } from '../../telegram/back-button/back-button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface FeedTask extends Question {
  selectedOption: number | null;
  swipeOffset: number;
  isSwiping: boolean;
  status: 'pending' | 'confirmed' | 'skipped';
}

@Component({
  selector: 'app-task-feed',
  imports: [CommonModule, MatRipple],
  templateUrl: './task-feed.html',
  styleUrl: './task-feed.scss',
})
export class TaskFeed implements OnInit, OnDestroy {
  quizStateService = inject(QuizStateService);
  tasks = signal<FeedTask[]>([]);
  currentIndex = signal<number>(0);

  currentTask = computed(() => {
    const allTasks = this.tasks();
    const index = this.currentIndex();
    return index < allTasks.length ? allTasks[index] : null;
  });

  isFinished = computed(() => this.quizStateService.isFinished());
  currentTopicName = computed(() => this.quizStateService.currentTopicName());
  feedbackState = signal<'correct' | 'incorrect' | null>(null);
  feedbackMessage = signal<string>('');
  // Переменные для отслеживания свайпа
  private startX = 0;
  private currentX = 0;
  private readonly SWIPE_THRESHOLD = 120; // Пикселей для срабатывания
  private currentTopic: number | undefined;
  private currentDifficulty: number | undefined;

  constructor(
    private telegram: Telegram,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private backButton: BackButton,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.setUpBackButton();
    this.getRouteParams();
  }

  ngOnDestroy() {
    this.backButton.hide();
  }

  setUpBackButton() {
    this.backButton.show();

    this.backButton.click$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.quizStateService.clearState();
      this.router.navigate(['/']);
    });
  }

  getRouteParams() {
    this.route.queryParams.subscribe((params) => {
      if (params['resume'] === 'true') {
        this.tasks.set(this.quizStateService.tasks());
        this.currentIndex.set(this.quizStateService.currentIndex());
        this.currentTopic = this.quizStateService.currentTopic();
        this.currentDifficulty = this.quizStateService.currentDifficulty();
      } else {
        this.currentTopic = params['topic'] ? Number(params['topic']) : undefined;
        this.currentDifficulty = params['difficulty'] ? Number(params['difficulty']) : undefined;
        const topicName = params['topicName'];

        // Reset state if params change
        this.quizStateService.clearState();
        this.quizStateService.currentTopic.set(this.currentTopic);
        this.quizStateService.currentDifficulty.set(this.currentDifficulty);
        if (topicName) {
          this.quizStateService.currentTopicName.set(topicName);
        }

        this.tasks.set([]);
        this.currentIndex.set(0);
        this.loadMoreTasks();
      }
    });
  }

  async loadMoreTasks() {
    try {
      const newQuestions = await firstValueFrom(
        this.apiService.getFeed(this.currentDifficulty, this.currentTopic, 10),
      );

      if (newQuestions.length === 0) {
        this.quizStateService.isFinished.set(true);
        return;
      }

      const newTasks: FeedTask[] = newQuestions.map((q) => ({
        ...q,
        selectedOption: null,
        swipeOffset: 0,
        isSwiping: false,
        status: 'pending',
      }));
      this.tasks.update((t) => {
        const updatedTasks = [...t, ...newTasks];
        this.quizStateService.tasks.set(updatedTasks);
        return updatedTasks;
      });
    } catch (error) {
      console.error('Error loading more tasks:', error);
    }
  }

  selectOption(task: FeedTask, optionId: number) {
    if (task.status !== 'pending') return;
    task.selectedOption = optionId;
    this.updateTask(task);
  }

  getTransform(task: FeedTask): string {
    const rotation = task.swipeOffset * 0.05; // 5 degrees per 100px
    return `translateX(${task.swipeOffset}px) rotateZ(${rotation}deg)`;
  }

  // === Логика свайпов ===

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

  backToTopics() {
    this.quizStateService.clearState();
    this.router.navigate(['/quiz-start']);
  }

  private updateTask(updatedTask: FeedTask) {
    this.tasks.update((tasks) => {
      const updatedTasks = tasks.map((t) => (t.id === updatedTask.id ? { ...updatedTask } : t));
      this.quizStateService.tasks.set(updatedTasks);
      return updatedTasks;
    });
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
        },
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

    this.currentIndex.set(nextIdx);
    this.quizStateService.currentIndex.set(nextIdx);

    // Check if we reached the end of the feed (no more tasks returned from API)
    if (nextIdx >= this.tasks().length) {
      this.loadMoreTasks();
    } else if (nextIdx >= this.tasks().length - 3) {
      this.loadMoreTasks();
    }
  }
}
