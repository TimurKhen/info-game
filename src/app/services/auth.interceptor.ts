import { HttpInterceptorFn } from '@angular/common/http';

export const telegramAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const initData = (window as any).Telegram?.WebApp?.initData ?? '';
  if (!initData) {
    return next(req); // вне Telegram (локальная разработка) — без заголовка
  }
  return next(req.clone({
    setHeaders: { Authorization: `tma ${initData}` },
  }));
};
