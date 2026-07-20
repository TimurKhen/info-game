import { Routes } from '@angular/router';
import { TaskFeed } from './components/task-feed/task-feed';

export const routes: Routes = [
  { path: 'feed', component: TaskFeed },
  { path: 'profile', loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent) },
  { path: '', redirectTo: 'feed', pathMatch: 'full' }
];
