import { Service } from '@angular/core';
import { User } from './user';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    Telegram: any;
  }
}

@Service()
export class Telegram {
  readonly isAvailable = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
  tg: any = null;

  constructor() {
    if (this.isAvailable) {
      this.tg = window.Telegram.WebApp;
    }
  }

  get webApp() {
    return this.isAvailable ? this.tg : null;
  }

  get user(): User {
    return this.tg.initDataUnsafe?.user;
  }

  ready(): void {
    if (this.isAvailable) {
      this.tg.ready();
    } else {
      console.log('[TG-Mock]: App is ready');
    }
  }

  expand(): void {
    if (this.isAvailable) {
      this.tg.expand();
    } else {
      console.log('[TG-Mock]: App expanded');
    }
  }

  close(): void {
    if (this.isAvailable) {
      this.tg.close();
    } else {
      console.log('[TG-Mock]: App closed');
    }
  }

  enableClosingConfirmation() {
    if (this.isAvailable) {
      this.tg.enableClosingConfirmation();
    } else {
      console.log('[TG-Mock]: App enableClosingConfirmation');
    }
  }

  disableClosingConfirmation() {
    if (this.isAvailable) {
      this.tg.disableClosingConfirmation();
    } else {
      console.log('[TG-Mock]: App disableClosingConfirmation');
    }
  }

  alerter(val: string) {
    if (!environment.production) {
      alert(val)
    }
  }
}
