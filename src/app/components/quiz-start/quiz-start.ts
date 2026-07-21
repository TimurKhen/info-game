import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Topic } from '../../services/api.service';
import { QuizStateService } from '../../services/quiz-state.service';

@Component({
  selector: 'app-quiz-start',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-start.html',
  styleUrl: './quiz-start.scss',
})
export class QuizStartComponent implements OnInit {
  private apiService = inject(ApiService);
  private quizStateService = inject(QuizStateService);

  hasActiveSession = computed(() => {
    return this.quizStateService.tasks().length > 0 && !this.quizStateService.isFinished();
  });

  selectedDifficulty = signal<number | null>(null);
  selectedTheme = signal<number | null>(null);
  selectedThemeId = signal<number | null>(null);

  topics = signal<Topic[]>([]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.apiService.getTopics().subscribe((topics) => {
      this.topics.set(topics);
    });
  }

  selectDifficulty(level: number) {
    this.selectedDifficulty.set(level);
  }

  selectTheme(id: number, item_id: number) {
    this.selectedTheme.set(id);
    this.selectedThemeId.set(item_id);
  }

  startTasks() {
    const diff = this.selectedDifficulty();
    const topic = this.selectedThemeId();
    const queryParams: any = {};

    if (diff !== null) {
      queryParams.difficulty = diff;
    }

    if (topic !== null) {
      queryParams.topic = topic;
      const selectedTopicObj = this.topics().find(t => t.id === topic);
      if (selectedTopicObj) {
         queryParams.topicName = selectedTopicObj.name;
      }
    }

    this.router.navigate(['/feed'], { queryParams });
  }

  continuePlaying() {
    this.router.navigate(['/feed'], { queryParams: { resume: 'true' } });
  }
}
