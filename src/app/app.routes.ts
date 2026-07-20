import { Routes } from '@angular/router';
import { TaskFeed } from './components/task-feed/task-feed';

export const routes: Routes = [
  { path: 'select-topic', loadComponent: () => import('./components/topic-select/topic-select').then(m => m.TopicSelectComponent) },
  { path: 'feed', component: TaskFeed },
  { path: 'profile', loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent) },
  { path: '', redirectTo: 'select-topic', pathMatch: 'full' }
];
