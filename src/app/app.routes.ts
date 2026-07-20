import { Routes } from '@angular/router';
import { TaskFeed } from './components/task-feed/task-feed';

export const routes: Routes = [
  { path: 'quiz-start', loadComponent: () => import('./components/quiz-start/quiz-start').then(m => m.QuizStartComponent) },
  { path: 'feed', component: TaskFeed },
  { path: 'profile', loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent) },
  { path: '', redirectTo: 'quiz-start', pathMatch: 'full' }
];
