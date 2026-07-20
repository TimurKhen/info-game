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

  /**
   * Показывает, видима ли кнопка в данный момент
   */
  get isVisible(): boolean {
    return this.tgBackButton?.isVisible ?? false;
  }

  /**
   * Показывает кнопку "Назад" в хедере Telegram
   */
  show(): this {
    this.tgBackButton?.show();
    return this;
  }

  /**
   * Скрывает кнопку "Назад"
   */
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

// In a component use like:
//   private backButton = inject(BackButtonService);
//   private router = inject(Router);
//   private destroyRef = inject(DestroyRef);

//   ngOnInit() {
//     // 1. Показываем кнопку при заходе в компонент
//     this.backButton.show();

//     // 2. Подписываемся на клик через удобный RxJS-поток
//     this.backButton.click$
//       .pipe(takeUntilDestroyed(this.destroyRef)) // Автоматическая отписка при уходе со страницы!
//       .subscribe(() => {
//         // Логика при нажатии (например, возвращаемся на главную)
//         this.router.navigate(['/']);
//       });
//   }

//   ngOnDestroy() {
//     // 3. Обязательно скрываем кнопку, когда уходим с этой страницы
//     this.backButton.hide();
//   }
