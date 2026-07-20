import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Telegram } from './telegram/telegram';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private tgService = inject(Telegram);
  userData = signal<any>(null);

  ngOnInit() {
    this.tgService.ready();
    this.tgService.expand();
    this.getUserInformation();
  }

  getUserInformation() {
    const user = this.tgService.user;
    this.userData.set(user);
  }
}
