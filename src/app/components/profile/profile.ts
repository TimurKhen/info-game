import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, HistoryQuestion, UserStats } from '../../services/api.service';
import { Telegram } from '../../telegram/telegram';
import { firstValueFrom } from 'rxjs';
import { History } from "./history/history";

@Component({
  selector: 'app-profile',
  imports: [CommonModule, History],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  stats = signal<UserStats | null>(null);
  user = signal<any>(null);
  history = signal<HistoryQuestion[] | null>(null);

  private telegram = inject(Telegram)
  private apiService = inject(ApiService)

  ngOnInit() {
    this.getUserInformation()
    try {
      this.getUserStats()
      this.getUserHistory()
    } catch (e) {
      console.error('Failed to load user stats', e);
    }
  }

  getUserInformation() {
    const user = this.telegram.user;
    this.user.set(user);
    this.telegram.alerter(`User info: ${JSON.stringify(user)}`);
  }

  getUserStats() {
    this.apiService.getUserStats().subscribe((val) => {
      this.telegram.alerter(JSON.stringify(val))
      this.stats.set(val);
    })
  }

  getUserHistory() {
    this.apiService.getHistory().subscribe((history) => {
      this.telegram.alerter(JSON.stringify(history));
      this.history.set(history);
    });
  }
}
