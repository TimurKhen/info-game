import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface Task {
  id: number;
  description: string;
  options: string[];
  selectedOption: string | null;
  swipeOffset: number;
  isSwiping: boolean;
  status: 'pending' | 'confirmed' | 'skipped';
}

@Component({
  selector: 'app-task-feed',
  imports: [CommonModule, ScrollingModule],
  templateUrl: './task-feed.html',
  styleUrl: './task-feed.scss',
})
export class TaskFeed implements OnInit {
  tasks: Task[] = [];

  // Переменные для отслеживания свайпа
  private startX = 0;
  private currentX = 0;
  private readonly SWIPE_THRESHOLD = 120; // Пикселей для срабатывания

  ngOnInit() {
    this.loadMoreTasks();
  }

  // Генерация фейковых данных для бесконечной ленты
  loadMoreTasks() {
    const newTasks = Array.from({ length: 10 }).map((_, i) => ({
      id: this.tasks.length + i + 1,
      description: `Задача #${this.tasks.length + i + 1}: Как правильно настроить Nginx для Angular приложения с роутингом?`,
      options: [
        'Использовать try_files $uri $uri/ /index.html;',
        'Оставить дефолтный конфиг',
        'Включить SSR без изменений Nginx'
      ],
      selectedOption: null,
      swipeOffset: 0,
      isSwiping: false,
      status: 'pending' as const
    }));
    this.tasks = [...this.tasks, ...newTasks];
  }

  selectOption(task: Task, option: string) {
    if (task.status !== 'pending') return;
    task.selectedOption = option;
  }

  // === Логика свайпов ===

  onTouchStart(event: TouchEvent, task: Task) {
    // Свайпать можно только если выбран вариант ответа
    if (!task.selectedOption || task.status !== 'pending') return;

    this.startX = event.touches[0].clientX;
    task.isSwiping = true;
  }

  onTouchMove(event: TouchEvent, task: Task) {
    if (!task.isSwiping) return;

    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.startX;

    // Блокируем свайп, если он слишком слабый (защита от случайных дрожаний)
    task.swipeOffset = deltaX;
  }

  onTouchEnd(task: Task) {
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

  private confirmTask(task: Task) {
    task.swipeOffset = -window.innerWidth; // Уводим экран влево
    task.status = 'confirmed';
    setTimeout(() => this.scrollToNext(), 300);
  }

  private skipTask(task: Task) {
    task.swipeOffset = window.innerWidth; // Уводим экран вправо
    task.status = 'skipped';
    setTimeout(() => this.scrollToNext(), 300);
  }

  // Программный скролл к следующей задаче после ответа
  private scrollToNext() {
    const viewport = document.querySelector('.cdk-virtual-scroll-viewport');
    if (viewport) {
      viewport.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  }

  // Подгрузка данных при приближении к концу списка
  onScrollIndexChange(index: number) {
    if (index === this.tasks.length - 2) {
      this.loadMoreTasks();
    }
  }
}
