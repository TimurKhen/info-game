import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Topic } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-topic-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-select.html',
  styleUrl: './topic-select.scss',
})
export class TopicSelectComponent implements OnInit {
  topics = signal<Topic[]>([]);
  selectedTopic = signal<number | null>(null);
  selectedDifficulty = signal<number | null>(null);

  constructor(private apiService: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      const fetchedTopics = await firstValueFrom(this.apiService.getTopics());
      this.topics.set(fetchedTopics);
    } catch (e) {
      console.error('Failed to fetch topics', e);
    }
  }

  selectTopic(id: number) {
    this.selectedTopic.set(id);
  }

  selectDifficulty(level: number) {
    this.selectedDifficulty.set(level);
  }

  startTasks() {
    const topicId = this.selectedTopic();
    if (topicId === null) return;

    const queryParams: any = { topic: topicId };
    const diff = this.selectedDifficulty();
    if (diff !== null) queryParams.difficulty = diff;

    this.router.navigate(['/feed'], { queryParams });
  }
}
