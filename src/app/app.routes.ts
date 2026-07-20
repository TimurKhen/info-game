import { Routes } from '@angular/router';
import { TaskFeed } from './components/task-feed/task-feed';
import { QuizStartComponent } from './components/quiz-start/quiz-start';

export const routes: Routes = [
  { path: 'quiz-start', component: QuizStartComponent },
  { path: 'feed', component: TaskFeed },
  { path: 'profile', loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent) },
  { path: '', redirectTo: 'quiz-start', pathMatch: 'full' }
];
