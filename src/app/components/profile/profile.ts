import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, UserStats } from '../../services/api.service';
import { Telegram } from '../../telegram/telegram';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  stats = signal<UserStats | null>(null);
  user = signal<any>(null);

  constructor(private apiService: ApiService, private tgService: Telegram) {}

  async ngOnInit() {
    this.user.set(this.tgService.user);
    try {
      const userStats = await firstValueFrom(this.apiService.getUserStats());
      this.stats.set(userStats);
    } catch (e) {
      console.error('Failed to load user stats', e);
    }
  }
}
