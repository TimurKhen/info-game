import { Injectable, signal } from '@angular/core';
import { FeedTask } from '../components/task-feed/task-feed';

@Injectable({
  providedIn: 'root'
})
export class QuizStateService {
  tasks = signal<FeedTask[]>([]);
  currentIndex = signal<number>(0);
  currentDifficulty = signal<number | undefined>(undefined);
  currentTopic = signal<number | undefined>(undefined);
  currentTopicName = signal<string | undefined>(undefined);
  hasMoreTasks = signal<boolean>(true);
  isFinished = signal<boolean>(false);

  saveState(
    tasks: FeedTask[],
    currentIndex: number,
    difficulty: number | undefined,
    topic: number | undefined,
    topicName: string | undefined,
    hasMoreTasks: boolean,
    isFinished: boolean
  ) {
    this.tasks.set(tasks);
    this.currentIndex.set(currentIndex);
    this.currentDifficulty.set(difficulty);
    this.currentTopic.set(topic);
    this.currentTopicName.set(topicName);
    this.hasMoreTasks.set(hasMoreTasks);
    this.isFinished.set(isFinished);
  }

  clearState() {
    this.tasks.set([]);
    this.currentIndex.set(0);
    this.currentDifficulty.set(undefined);
    this.currentTopic.set(undefined);
    this.currentTopicName.set(undefined);
    this.hasMoreTasks.set(true);
    this.isFinished.set(false);
  }
}
