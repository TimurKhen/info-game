import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-start',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-start.html',
  styleUrl: './quiz-start.scss',
})
export class QuizStartComponent {
  selectedDifficulty = signal<number | null>(null);

  constructor(private router: Router) {}

  selectDifficulty(level: number) {
    this.selectedDifficulty.set(level);
  }

  startTasks() {
    const diff = this.selectedDifficulty();
    const queryParams: any = {};
    if (diff !== null) {
      queryParams.difficulty = diff;
    }

    this.router.navigate(['/feed'], { queryParams });
  }
}
