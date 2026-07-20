import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, UserStats } from '../../services/api.service';
import { Telegram } from '../../telegram/telegram';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  stats = signal<UserStats | null>(null);
  user = signal<any>(null);

  private telegram = inject(Telegram)
  private apiService = inject(ApiService)

  ngOnInit() {
    this.getUserInformation()
    try {
      this.apiService.getUserStats().subscribe((val) => {
        this.stats.set(val);
      })
    } catch (e) {
      console.error('Failed to load user stats', e);
    }
  }

  getUserInformation() {
    const user = this.telegram.user;
    this.user.set(user);
    this.telegram.alerter(`User info: ${JSON.stringify(user)}`);
  }

}
