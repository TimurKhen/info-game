import { Service } from '@angular/core';
import { Subject } from 'rxjs';

@Service()
export class BackButton {
  private get tgBackButton() {
    return (window as any).Telegram?.WebApp?.BackButton;
  }

  private clickSubject = new Subject<void>();
  public click$ = this.clickSubject.asObservable();

  constructor() {
    if (this.tgBackButton) {
      this.tgBackButton.onClick(() => {
        this.clickSubject.next();
      });
    }
  }

  get isVisible(): boolean {
    return this.tgBackButton?.isVisible ?? false;
  }

  show(): this {
    this.tgBackButton?.show();
    return this;
  }

  hide(): this {
    this.tgBackButton?.hide();
    return this;
  }

  onClick(callback: () => void): this {
    this.tgBackButton?.onClick(callback);
    return this;
  }

  offClick(callback: () => void): this {
    this.tgBackButton?.offClick(callback);
    return this;
  }
}
